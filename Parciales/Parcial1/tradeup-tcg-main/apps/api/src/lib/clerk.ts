import { createClerkClient, verifyToken } from '@clerk/backend'
import type { Context, Next } from 'hono'

// ─── Exported type used by types.d.ts ────────────────────────────────────────────
export type AppRole = 'buyer' | 'seller' | 'admin'

// ─── Clerk client (for users.getUser, updateUserMetadata, etc.) ──────────────
export const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY'],
  publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
})

// ─── requireAuth ────────────────────────────────────────────────────────────
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

    // Clerk JWT puede incluir el rol en varias ubicaciones segun la version del SDK.
    // Probamos todas las variantes posibles: camelCase, snake_case y nesting en metadata.
    const p = payload as any
    const role: AppRole =
      p?.publicMetadata?.role ??        // clerk-react v5+ / JWT claims
      p?.public_metadata?.role ??       // versiones anteriores
      p?.metadata?.role ??              // algunas versiones intermedias
      p?.['public_metadata']?.role ??   // acceso por key string
      'buyer'

    c.set('userId', payload.sub)
    c.set('role', role)

    await next()
  } catch {
    return c.json({ error: 'Unauthorized: invalid or expired token' }, 401)
  }
}

// ─── requireSeller ────────────────────────────────────────────────────
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

// ─── requireAdmin ─────────────────────────────────────────────────────
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
