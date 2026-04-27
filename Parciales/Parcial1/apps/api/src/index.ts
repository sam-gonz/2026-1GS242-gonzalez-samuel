import 'dotenv/config';
import { Hono } from 'hono';
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
import { serve } from 'bun';
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

async function startServer() {
  // avoid double-start across HMR reloads
  if ((globalThis as any).__tradeup_api_server_started) {
    console.log('API server already started, skipping start.');
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    try {
      const mod = await import('hono/dev');
      if (mod && typeof mod.dev === 'function') {
        (globalThis as any).__tradeup_api_server_started = true;
        mod.dev({
          fetch: app.fetch,
          port,
          onReady: async () => {
            console.log(`Server running on port ${port}`);
            await connectDB();
          },
        });
        return;
      }
    } catch (err) {
      console.warn('hono/dev not available, falling back to Bun.serve');
    }
  }

  // production or fallback
  try {
    await connectDB();
  } catch (err) {
    console.warn('connectDB failed:', err);
  }

  try {
    (globalThis as any).__tradeup_api_server_started = true;
    serve({
      fetch: app.fetch,
      port,
    });
  } catch (err: any) {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} already in use, skipping Bun.serve`);
    } else {
      console.error('Failed to start server:', err);
      throw err;
    }
  }
}

startServer();

export default app;