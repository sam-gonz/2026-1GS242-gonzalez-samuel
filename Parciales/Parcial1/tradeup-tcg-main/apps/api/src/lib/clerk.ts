import { createClerkClient, verifyToken } from '@clerk/backend'
import type { Context, Next } from 'hono'
import { User } from '@tradeup/db'

export type AppRole = 'buyer' | 'seller' | 'admin'

export const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY'],
  publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
})

export async function requireAuth(c: Context, next: Next) {
  const authorization = c.req.header('Authorization')
  const token = authorization?.startsWith('Bearer ')
    ? authorization.replace('Bearer ', '')
    : undefined

  if (!token) {
    return c.json({ error: 'Unauthorized: missing bearer token' }, 401)
  }

  const secretKey = process.env['CLERK_SECRET_KEY']
  if (!secretKey) {
    return c.json({ error: 'Server misconfiguration: missing CLERK_SECRET_KEY' }, 500)
  }

  try {
    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties: [
        process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
        process.env['CORS_ORIGIN_BACKOFFICE'] ?? 'http://localhost:3002',
      ],
    })

    // Lee el rol directamente desde MongoDB — no depende del JWT template de Clerk
    const dbUser = await User.findOne({ clerkId: payload.sub }).select('role').lean()
    const role: AppRole = (dbUser?.role as AppRole) ?? 'buyer'

    c.set('userId', payload.sub)
    c.set('role', role)

    await next()
  } catch {
    return c.json({ error: 'Unauthorized: invalid or expired token' }, 401)
  }
}

export async function requireSeller(c: Context, next: Next) {
  let passed = false
  await requireAuth(c, async () => { passed = true })
  if (!passed) return

  const role = c.get('role')
  if (role !== 'seller' && role !== 'admin') {
    return c.json({ error: 'Forbidden: seller role required' }, 403)
  }
  await next()
}

export async function requireAdmin(c: Context, next: Next) {
  let passed = false
  await requireAuth(c, async () => { passed = true })
  if (!passed) return

  const role = c.get('role')
  if (role !== 'admin') {
    return c.json({ error: 'Forbidden: admin role required' }, 403)
  }
  await next()
}
