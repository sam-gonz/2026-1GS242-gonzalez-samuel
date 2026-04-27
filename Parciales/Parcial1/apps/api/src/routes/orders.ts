import { Hono } from 'hono';
import Stripe from 'stripe';
import { Order } from '../models/order.js';
import { Card } from '../models/card.js';
import { User } from '../models/user.js';
import { Notification } from '../models/notification.js';
import { orderCreateSchema } from '../schemas/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const orders = new Hono();

orders.post('/checkout-session', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = orderCreateSchema.parse(body);
  
  const [buyer, card] = await Promise.all([
    User.findOne({ clerkId: userId }),
    Card.findById(parsed.cardId).populate('sellerId'),
  ]);
  
  if (!buyer || !card) {
    return c.json({ success: false, error: 'User or card not found' }, 404);
  }
  
  if (card.status !== 'available') {
    return c.json({ success: false, error: 'Card not available' }, 400);
  }
  
  const seller = card.sellerId as unknown as User;
  const platformFee = Math.round(card.price * (parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT || '5') / 100));
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: card.currency.toLowerCase(),
        product_data: {
          name: card.title,
          description: `${card.set}${card.cardNumber ? ` #${card.cardNumber}` : ''} - ${card.condition}`,
          images: card.images.length > 0 ? [card.images[0]] : [],
        },
        unit_amount: Math.round(card.price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/orders/{CHECKOUT_SESSION_ID}/confirmation`,
    cancel_url: `${process.env.FRONTEND_URL}/marketplace/${card._id}`,
    customer_email: buyer.email,
    payment_intent_data: {
      application_fee_amount: platformFee,
      metadata: {
        cardId: card._id.toString(),
        buyerId: buyer._id.toString(),
        sellerId: seller._id.toString(),
      },
    },
    metadata: {
      cardId: card._id.toString(),
      buyerId: buyer._id.toString(),
      sellerId: seller._id.toString(),
    },
  });
  
  const order = await Order.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    cardId: card._id,
    stripeSessionId: session.id,
    amount: card.price,
    currency: card.currency,
    status: 'pending',
    shippingAddress: parsed.shippingAddress,
  });
  
  return c.json({ success: true, data: { sessionId: session.id, url: session.url } });
});

orders.get('/', async (c) => {
  const userId = c.get('userId');
  const { role } = c.req.query();
  
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const filter: Record<string, unknown> = {};
  
  if (role === 'seller') {
    filter.sellerId = user._id;
  } else if (role === 'buyer') {
    filter.buyerId = user._id;
  } else {
    filter.$or = [{ buyerId: user._id }, { sellerId: user._id }];
  }
  
  const ordersList = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('cardId')
    .populate('buyerId', 'username avatar')
    .populate('sellerId', 'username avatar');
  
  return c.json({ success: true, data: ordersList });
});

orders.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const order = await Order.findById(id)
    .populate('cardId')
    .populate('buyerId', 'username avatar email')
    .populate('sellerId', 'username avatar email');
  
  if (!order) {
    return c.json({ success: false, error: 'Order not found' }, 404);
  }
  
  return c.json({ success: true, data: order });
});

orders.patch('/:id/ship', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const order = await Order.findOne({ _id: id, sellerId: user._id });
  
  if (!order) {
    return c.json({ success: false, error: 'Order not found or unauthorized' }, 404);
  }
  
  if (order.status !== 'paid') {
    return c.json({ success: false, error: 'Order must be paid before shipping' }, 400);
  }
  
  await Order.findByIdAndUpdate(id, { status: 'shipped' });
  
  await Notification.create({
    userId: order.buyerId,
    type: 'order_paid',
    message: 'Tu pedido ha sido enviado',
    metadata: { orderId: id },
  });
  
  return c.json({ success: true, message: 'Order marked as shipped' });
});

export default orders;
export { stripe };