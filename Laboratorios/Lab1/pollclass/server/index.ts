import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { connectDB } from './config/db';
import polls from './routes/polls';
import votes from './routes/votes';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));

app.get('/api/health', (c) => c.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
}));

app.route('/api/polls', polls);
app.route('/api/polls', votes);

app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404));

app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

async function start() {
  try {
    await connectDB();
    
    const port = Number(process.env.PORT) || 3001;
    
    console.log(`
╔═══════════════════════════════════════════╗
║         PollClass API Server              ║
║═══════════════════════════════════════════║
║  Status:  Running                         ║
║  Port:    ${port}                            ║
║  Env:     ${(process.env.NODE_ENV || 'development').padEnd(27)}║
╚═══════════════════════════════════════════╝
    `);
    
    serve({
      fetch: app.fetch,
      port,
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
