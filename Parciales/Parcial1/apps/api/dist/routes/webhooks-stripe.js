import { Hono } from 'hono';
import Stripe from 'stripe';
import { Order } from '../models/order.js';
import { Card } from '../models/card.js';
import { Notification } from '../models/notification.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
const webhooks = new Hono();
webhooks.post('/stripe', async (c) => {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    if (!signature) {
        return c.json({ success: false, error: 'Missing signature' }, 400);
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        return c.json({ success: false, error: 'Invalid signature' }, 400);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { cardId, buyerId, sellerId } = session.metadata || {};
        if (cardId && buyerId && sellerId) {
            await Promise.all([
                Order.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'paid', stripePaymentIntentId: session.payment_intent }, { new: true }),
                Card.findByIdAndUpdate(cardId, { status: 'sold' }),
                Notification.create({
                    userId: buyerId,
                    type: 'order_paid',
                    message: 'Tu pago ha sido confirmado. El vendedor será notificado.',
                    metadata: { cardId, orderId: session.id },
                }),
                Notification.create({
                    userId: sellerId,
                    type: 'order_paid',
                    message: '¡Tienes una nueva venta confirmada!',
                    metadata: { cardId, orderId: session.id },
                }),
            ]);
        }
    }
    if (event.type === 'charge.refunded') {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        const order = await Order.findOneAndUpdate({ stripePaymentIntentId: paymentIntentId }, { status: 'refunded' }, { new: true });
        if (order) {
            await Card.findByIdAndUpdate(order.cardId, { status: 'available' });
        }
    }
    if (event.type === 'checkout.session.expired') {
        const session = event.data.object;
        await Order.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'cancelled' }, { new: true });
    }
    return c.json({ success: true, received: true });
});
export default webhooks;
