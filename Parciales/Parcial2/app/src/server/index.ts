import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { connectDB } from './db'
import pokemon from './routes/pokemon'
import rooms from './routes/rooms'
import battle from './routes/battle'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

// API routes
app.route('/api/pokemon', pokemon)
app.route('/api/rooms', rooms)
app.route('/api/battle', battle)

// Serve frontend static files
app.use('/*', serveStatic({ root: './dist/client' }))

// SPA fallback — all unknown routes serve index.html
app.get('/*', serveStatic({ path: './dist/client/index.html' }))

connectDB().then(() => {
  console.log('MongoDB connected')
  console.log(`Server running on port ${process.env.PORT ?? 3000}`)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}
