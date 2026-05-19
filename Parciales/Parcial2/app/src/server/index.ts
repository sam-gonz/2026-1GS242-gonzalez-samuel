import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectDB } from './db'
import pokemon from './routes/pokemon'
import rooms from './routes/rooms'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Pokémon Battle Rooms API running 🎮' })
})

app.route('/api/pokemon', pokemon)
app.route('/api/rooms', rooms)

connectDB().then(() => {
  console.log('✅ MongoDB connected')
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}
