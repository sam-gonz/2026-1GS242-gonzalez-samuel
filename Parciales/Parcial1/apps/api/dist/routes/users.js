import { Hono } from 'hono';
import { User } from '../models/user.js';
import { Review } from '../models/review.js';
import { Card } from '../models/card.js';
import { TradePost } from '../models/tradepost.js';
import { reviewSchema } from '../schemas/index.js';
const users = new Hono();
users.get('/:username', async (c) => {
    const username = c.req.param('username');
    const user = await User.findOne({ username }).select('-isSuspended');
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const [activeListings, activeTrades] = await Promise.all([
        Card.countDocuments({ sellerId: user._id, status: 'available' }),
        TradePost.countDocuments({ userId: user._id, status: 'open' }),
    ]);
    return c.json({
        success: true,
        data: {
            ...user.toObject(),
            activeListings,
            activeTrades,
        },
    });
});
users.get('/:id/reviews', async (c) => {
    const userId = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const user = await User.findById(userId);
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
        Review.find({ reviewedUserId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('reviewerId', 'username avatar'),
        Review.countDocuments({ reviewedUserId: userId }),
    ]);
    return c.json({
        success: true,
        data: reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
users.post('/:id/reviews', async (c) => {
    const userId = c.req.param('id');
    const currentUserId = c.get('userId');
    const body = await c.req.json();
    const parsed = reviewSchema.parse(body);
    const currentUser = await User.findOne({ clerkId: currentUserId });
    if (!currentUser) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const existingReview = await Review.findOne({
        reviewerId: currentUser._id,
        reviewedUserId: userId,
    });
    if (existingReview) {
        return c.json({ success: false, error: 'Already reviewed' }, 400);
    }
    const review = await Review.create({
        reviewerId: currentUser._id,
        reviewedUserId: userId,
        orderId: parsed.orderId,
        rating: parsed.rating,
        comment: parsed.comment,
    });
    const reviews = await Review.find({ reviewedUserId: userId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(userId, {
        rating: avgRating,
        reviewCount: reviews.length,
    });
    return c.json({ success: true, data: review }, 201);
});
users.patch('/me', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
    }
    const allowedUpdates = ['bio', 'avatar'];
    const updates = {};
    for (const key of allowedUpdates) {
        if (body[key] !== undefined) {
            updates[key] = body[key];
        }
    }
    const updated = await User.findByIdAndUpdate(user._id, updates, { new: true });
    return c.json({ success: true, data: updated });
});
export default users;
