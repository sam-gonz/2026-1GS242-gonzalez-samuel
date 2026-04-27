import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.BACKOFFICE_URL || 'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
});

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      500
    );
  }
};