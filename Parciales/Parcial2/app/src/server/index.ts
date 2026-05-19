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

// Serve static assets (JS, CSS, images)
app.use('/*', serveStatic({ root: '/app/dist/client' }))

// SPA fallback — serve index.html for all non-API routes
app.get('/*', async (c) => {
  const file = Bun.file('/app/dist/client/index.html')
  const html = await file.text()
  return c.html(html)
})

connectDB().then(() => {
  console.log('MongoDB connected')
  console.log(`Server running on port ${process.env.PORT ?? 3000}`)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}
