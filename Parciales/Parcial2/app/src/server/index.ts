import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectDB } from './db'
import pokemon from './routes/pokemon'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Pokémon Battle Rooms API running 🎮' })
})

// Rutas
app.route('/api/pokemon', pokemon)

// Conectar a MongoDB y levantar servidor
connectDB().then(() => {
  console.log('✅ MongoDB connected')
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}
