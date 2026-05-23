import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { connectDB } from './db'
import pokemonRoutes from './routes/pokemon'
import roomRoutes from './routes/rooms'
import battleRoutes from './routes/battle'
import userRoutes from './routes/users'
import paymentRoutes from './routes/payments'
import shinyRoutes from './routes/shiny'

const app = new Hono()

// Webhook de Stripe DEBE ir antes del bodyParser/json middleware
// y necesita el raw body — Hono lo lee como texto crudo
app.post('/api/payments/webhook', async (c) => {
  // Re-delegamos al handler de payments que ya tiene la logica
  return paymentRoutes.fetch(new Request(c.req.raw.url.replace('/api/payments/webhook', '/webhook'), {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  }))
})

app.route('/api/pokemon',   pokemonRoutes)
app.route('/api/rooms',     roomRoutes)
app.route('/api/battle',    battleRoutes)
app.route('/api/users',     userRoutes)
app.route('/api/payments',  paymentRoutes)
app.route('/api/shiny',     shinyRoutes)

app.use('*', serveStatic({ root: './dist/client' }))
app.get('*', serveStatic({ path: './dist/client/index.html' }))

async function start() {
  await connectDB()
  const port = Number(process.env.PORT) || 3000
  serve({ fetch: app.fetch, port })
  console.log(`Server running on http://localhost:${port}`)
}

start().catch(console.error)
