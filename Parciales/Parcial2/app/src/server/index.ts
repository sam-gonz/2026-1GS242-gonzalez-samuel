import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectDB } from './db'

// Routes (se agregan en fases posteriores)
// import pokemonRoutes from './routes/pokemon'
// import roomRoutes from './routes/rooms'
// import battleRoutes from './routes/battle'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Pokémon Battle Rooms API running 🎮' })
})

// Conectar a MongoDB y levantar servidor
connectDB().then(() => {
  console.log('✅ MongoDB connected')
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}
