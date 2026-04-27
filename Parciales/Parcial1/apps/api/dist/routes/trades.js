import { Hono } from 'hono';
import { TradePost } from '../models/tradepost.js';
import { TradeOffer } from '../models/tradeoffer.js';
import { User } from '../models/user.js';
import { Notification } from '../models/notification.js';
import { tradeCreateSchema, tradeOfferSchema } from '../schemas/index.js';
const trades = new Hono();
trades.get('/', async (c) => {
    const { game, search, status, page = '1', limit = '20' } = c.req.query();
    const filter = { status: status || 'open' };
    if (game) {
        filter['haves.game'] = game;
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [posts, total] = await Promise.all([
        TradePost.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'username avatar rating'),
        TradePost.countDocuments(filter),
    ]);
    return c.json({
        success: true,
        data: posts,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
});
trades.get('/:id', async (c) => {
    const id = c.req.param('id');
    const post = await TradePost.findById(id).populate('userId', 'username avatar rating bio');
    if (!post) {
        return c.json({ success: false, error: 'Trade post not found' }, 404);
    }
    return c.json({ success: true, data: post });
});
trades.post('/', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = tradeCreateSchema.parse(body);
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const post = await TradePost.create({
        ...parsed,
        userId: user._id,
    });
    return c.json({ success: true, data: post }, 201);
});
trades.patch('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const post = await TradePost.findOneAndUpdate({ _id: id, userId: user._id }, body, { new: true });
    if (!post) {
        return c.json({ success: false, error: 'Trade post not found or unauthorized' }, 404);
    }
    return c.json({ success: true, data: post });
});
trades.delete('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const role = c.get('userRole');
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const post = await TradePost.findById(id);
    if (!post) {
        return c.json({ success: false, error: 'Trade post not found' }, 404);
    }
    if (post.userId.toString() !== user._id.toString() && role !== 'admin') {
        return c.json({ success: false, error: 'Unauthorized' }, 403);
    }
    await TradePost.findByIdAndDelete(id);
    await TradeOffer.deleteMany({ tradePostId: id });
    return c.json({ success: true, message: 'Trade post deleted' });
});
trades.post('/:id/offers', async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = tradeOfferSchema.parse(body);
    const user = await User.findOne({ clerkId: userId });
    const post = await TradePost.findById(id);
    if (!user || !post) {
        return c.json({ success: false, error: 'User or post not found' }, 404);
    }
    if (post.userId.toString() === user._id.toString()) {
        return c.json({ success: false, error: 'Cannot make offer on own post' }, 400);
    }
    const offer = await TradeOffer.create({
        tradePostId: id,
        offererId: user._id,
        offeringCards: parsed.offeringCards,
        message: parsed.message,
    });
    await TradePost.findByIdAndUpdate(id, { $inc: { offerCount: 1 } });
    await Notification.create({
        userId: post.userId,
        type: 'offer_received',
        message: `Nueva oferta recibida en "${post.title}"`,
        metadata: { offerId: offer._id, tradePostId: id },
    });
    return c.json({ success: true, data: offer }, 201);
});
trades.get('/:id/offers', async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const user = await User.findOne({ clerkId: userId });
    const post = await TradePost.findById(id);
    if (!user || !post) {
        return c.json({ success: false, error: 'User or post not found' }, 404);
    }
    if (post.userId.toString() !== user._id.toString()) {
        return c.json({ success: false, error: 'Unauthorized' }, 403);
    }
    const offers = await TradeOffer.find({ tradePostId: id })
        .sort({ createdAt: -1 })
        .populate('offererId', 'username avatar');
    return c.json({ success: true, data: offers });
});
trades.patch('/:id/offers/:offerId', async (c) => {
    const id = c.req.param('id');
    const offerId = c.req.param('offerId');
    const userId = c.get('userId');
    const { status } = await c.req.json();
    const user = await User.findOne({ clerkId: userId });
    const post = await TradePost.findById(id);
    if (!user || !post) {
        return c.json({ success: false, error: 'User or post not found' }, 404);
    }
    if (post.userId.toString() !== user._id.toString()) {
        return c.json({ success: false, error: 'Unauthorized' }, 403);
    }
    if (!['accepted', 'rejected'].includes(status)) {
        return c.json({ success: false, error: 'Invalid status' }, 400);
    }
    const offer = await TradeOffer.findOneAndUpdate({ _id: offerId, tradePostId: id }, { status }, { new: true });
    if (!offer) {
        return c.json({ success: false, error: 'Offer not found' }, 404);
    }
    if (status === 'accepted') {
        await TradePost.findByIdAndUpdate(id, { status: 'completed' });
        await Notification.create({
            userId: offer.offererId,
            type: 'trade_accepted',
            message: `Tu oferta ha sido aceptada en "${post.title}"`,
            metadata: { tradePostId: id, offerId },
        });
    }
    return c.json({ success: true, data: offer });
});
export default trades;
