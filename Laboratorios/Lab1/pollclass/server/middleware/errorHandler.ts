import { Context, Next } from 'hono';

export class AppError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

export function badRequest(message = 'Bad request') {
  return new AppError(message, 400);
}

export function notFound(message = 'Not found') {
  return new AppError(message, 404);
}

export function conflict(message = 'Conflict') {
  return new AppError(message, 409);
}

export function unauthorized(message = 'Unauthorized') {
  return new AppError(message, 401);
}

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
    
    if (c.res.status === 404 && !c.res.ok) {
      return c.json({ error: 'Not found' }, 404);
    }
  } catch (err: any) {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    return c.json({ error: message }, status);
  }
}

export { AppError as default };
