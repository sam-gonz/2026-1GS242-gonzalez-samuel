import 'dotenv/config';
import { Hono } from 'hono';
import { dev } from 'hono/dev';
import connectDB from './db/connect';
import { clerkAuth } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limiter';
import { corsMiddleware, errorHandler } from './middleware/cors';
import cardsRouter from './routes/cards';
import usersRouter from './routes/users';
import tradesRouter from './routes/trades';
import ordersRouter from './routes/orders';
import notificationsRouter from './routes/notifications';
import webhooksRouter from './routes/webhooks';
import webhooksStripeRouter from './routes/webhooks-stripe';
import adminRouter from './routes/admin';

const app = new Hono();

app.use('*', corsMiddleware);
app.use('*', errorHandler);
app.use('*', rateLimiter);

app.get('/', (c) => c.json({ status: 'ok', message: 'TradeUp API v1' }));

app.route('/api/v1/cards', cardsRouter);
app.route('/api/v1/users', usersRouter);
app.route('/api/v1/trades', tradesRouter);
app.route('/api/v1/orders', ordersRouter);
app.route('/api/v1/notifications', notificationsRouter);

app.route('/api/v1/webhooks', webhooksRouter);
app.route('/api/v1/webhooks', webhooksStripeRouter);

app.route('/api/v1/admin', adminRouter);

const port = parseInt(process.env.PORT || '3001');

dev({
  fetch: app.fetch,
  port,
  onReady: async () => {
    console.log(`Server running on port ${port}`);
    await connectDB();
  },
});

export default app;