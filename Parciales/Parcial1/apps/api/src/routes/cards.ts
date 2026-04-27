import { Hono } from 'hono';
import { z } from 'zod';
import { Card } from '../models/card.js';
import { User } from '../models/user.js';
import { Notification } from '../models/notification.js';
import { cardCreateSchema, cardUpdateSchema, cardFilterSchema } from '../schemas/index.js';

const cards = new Hono();

cards.get('/', async (c) => {
  const query = c.req.query();
  const parsed = cardFilterSchema.parse(query);
  
  const filter: Record<string, unknown> = { status: 'available' };
  
  if (parsed.game) filter.game = parsed.game;
  if (parsed.condition) filter.condition = parsed.condition;
  if (parsed.priceMin || parsed.priceMax) {
    filter.price = {};
    if (parsed.priceMin) (filter.price as Record<string, number>).$gte = parsed.priceMin;
    if (parsed.priceMax) (filter.price as Record<string, number>).$lte = parsed.priceMax;
  }
  if (parsed.search) {
    filter.$or = [
      { title: { $regex: parsed.search, $options: 'i' } },
      { set: { $regex: parsed.search, $options: 'i' } },
    ];
  }
  
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (parsed.sort === 'price_asc') sort = { price: 1 };
  if (parsed.sort === 'price_desc') sort = { price: -1 };
  if (parsed.sort === 'oldest') sort = { createdAt: 1 };
  
  const skip = (parsed.page - 1) * parsed.limit;
  
  const [cardsList, total] = await Promise.all([
    Card.find(filter).sort(sort).skip(skip).limit(parsed.limit).populate('sellerId', 'username avatar rating'),
    Card.countDocuments(filter),
  ]);
  
  return c.json({
    success: true,
    data: cardsList,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      pages: Math.ceil(total / parsed.limit),
    },
  });
});

cards.get('/me', async (c) => {
  const userId = c.get('userId');
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const myCards = await Card.find({ sellerId: user._id, status: { $ne: 'deleted' } })
    .sort({ createdAt: -1 })
    .populate('sellerId', 'username avatar rating');
  
  return c.json({ success: true, data: myCards });
});

cards.get('/:id', async (c) => {
  const id = c.req.param('id');
  const card = await Card.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('sellerId', 'username avatar rating reviewCount');
  
  if (!card) {
    return c.json({ success: false, error: 'Card not found' }, 404);
  }
  
  return c.json({ success: true, data: card });
});

cards.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = cardCreateSchema.parse(body);
  
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const card = await Card.create({
    ...parsed,
    sellerId: user._id,
  });
  
  return c.json({ success: true, data: card }, 201);
});

cards.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = cardUpdateSchema.parse(body);
  
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const card = await Card.findOneAndUpdate(
    { _id: id, sellerId: user._id },
    { ...parsed, updatedAt: new Date() },
    { new: true }
  );
  
  if (!card) {
    return c.json({ success: false, error: 'Card not found or unauthorized' }, 404);
  }
  
  return c.json({ success: true, data: card });
});

cards.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  const user = await User.findOne({ clerkId: userId });
  const role = c.get('userRole');
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const card = await Card.findById(id);
  
  if (!card) {
    return c.json({ success: false, error: 'Card not found' }, 404);
  }
  
  if (card.sellerId.toString() !== user._id.toString() && role !== 'admin') {
    return c.json({ success: false, error: 'Unauthorized' }, 403);
  }
  
  await Card.findByIdAndUpdate(id, { status: 'deleted' });
  
  return c.json({ success: true, message: 'Card deleted' });
});

export default cards;