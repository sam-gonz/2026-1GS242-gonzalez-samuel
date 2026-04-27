import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || 
              c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
              'unknown';
  
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 100;
  
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      return c.json({ success: false, error: 'Too many requests' }, 429);
    }
  }
  
  await next();
};