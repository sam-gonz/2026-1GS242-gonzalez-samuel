import { Hono } from 'hono';
import { User } from '../../models/user.js';
import { Card } from '../../models/card.js';
import { Order } from '../../models/order.js';
import { Review } from '../../models/review.js';
import { Category } from '../../models/category.js';

const admin = new Hono();

admin.get('/stats', async (c) => {
  const [
    totalUsers,
    totalListings,
    activeListings,
    totalOrders,
    monthlyOrders,
  ] = await Promise.all([
    User.countDocuments(),
    Card.countDocuments(),
    Card.countDocuments({ status: 'available' }),
    Order.countDocuments(),
    Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
  ]);
  
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('cardId')
    .populate('buyerId', 'username')
    .populate('sellerId', 'username');
  
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username createdAt');
  
  return c.json({
    success: true,
    data: {
      users: { total: totalUsers },
      listings: { total: totalListings, active: activeListings },
      orders: { total: totalOrders, monthly: monthlyOrders, recent: recentOrders },
      recentUsers,
    },
  });
});

admin.get('/users', async (c) => {
  const { search, role, page = '1', limit = '20' } = c.req.query();
  
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);
  
  return c.json({
    success: true,
    data: users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

admin.patch('/users/:id/suspend', async (c) => {
  const id = c.req.param('id');
  const { suspend } = await c.req.json();
  
  const user = await User.findByIdAndUpdate(id, { isSuspended: suspend }, { new: true });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  return c.json({ success: true, data: user });
});

admin.patch('/users/:id/verify', async (c) => {
  const id = c.req.param('id');
  const { verify } = await c.req.json();
  
  const user = await User.findByIdAndUpdate(id, { isVerified: verify }, { new: true });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  return c.json({ success: true, data: user });
});

admin.get('/cards', async (c) => {
  const { game, status, page = '1', limit = '20' } = c.req.query();
  
  const filter: Record<string, unknown> = {};
  if (game) filter.game = game;
  if (status) filter.status = status;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const [cards, total] = await Promise.all([
    Card.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('sellerId', 'username'),
    Card.countDocuments(filter),
  ]);
  
  return c.json({
    success: true,
    data: cards,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

admin.delete('/cards/:id', async (c) => {
  const id = c.req.param('id');
  
  const card = await Card.findByIdAndDelete(id);
  
  if (!card) {
    return c.json({ success: false, error: 'Card not found' }, 404);
  }
  
  return c.json({ success: true, message: 'Card deleted' });
});

admin.get('/orders', async (c) => {
  const { status, page = '1', limit = '20' } = c.req.query();
  
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
      .populate('cardId')
      .populate('buyerId', 'username')
      .populate('sellerId', 'username'),
    Order.countDocuments(filter),
  ]);
  
  return c.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

admin.get('/reviews', async (c) => {
  const { page = '1', limit = '20' } = c.req.query();
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const [reviews, total] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum)
      .populate('reviewerId', 'username')
      .populate('reviewedUserId', 'username'),
    Review.countDocuments(),
  ]);
  
  return c.json({
    success: true,
    data: reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

admin.delete('/reviews/:id', async (c) => {
  const id = c.req.param('id');
  
  const review = await Review.findByIdAndDelete(id);
  
  if (!review) {
    return c.json({ success: false, error: 'Review not found' }, 404);
  }
  
  return c.json({ success: true, message: 'Review deleted' });
});

admin.get('/categories', async (c) => {
  const categories = await Category.find().sort({ game: 1, name: 1 });
  
  return c.json({ success: true, data: categories });
});

admin.post('/categories', async (c) => {
  const body = await c.req.json();
  
  const category = await Category.create(body);
  
  return c.json({ success: true, data: category }, 201);
});

admin.patch('/categories/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  
  if (!category) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }
  
  return c.json({ success: true, data: category });
});

admin.delete('/categories/:id', async (c) => {
  const id = c.req.param('id');
  
  const category = await Category.findByIdAndDelete(id);
  
  if (!category) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }
  
  return c.json({ success: true, message: 'Category deleted' });
});

export default admin;