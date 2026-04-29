import { Hono } from 'hono'
import { z } from 'zod'
import { Review, User, StoreItem } from '@tradeup/db'
import { requireAuth } from '../lib/clerk.js'

export const reviewRoutes = new Hono()

const createReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// ─── GET /api/reviews/store/:storeItemId (público) ────────────────────────────
reviewRoutes.get('/store/:storeItemId', async (c) => {
  const { storeItemId } = c.req.param()
  const page  = Number(c.req.query('page')  ?? 1)
  const limit = Number(c.req.query('limit') ?? 10)
  const skip  = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    Review.find({ storeItem: storeItemId })
      .populate('author', 'displayName avatarUrl clerkId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ storeItem: storeItemId }),
  ])

  const agg = await Review.aggregate([
    { $match: { storeItem: storeItemId } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ])
  const avgRating = agg[0]?.avg ?? null

  return c.json({ reviews, total, page, limit, totalPages: Math.ceil(total / limit), avgRating })
})

// ─── POST /api/reviews/store/:storeItemId (auth) ──────────────────────────────
reviewRoutes.post('/store/:storeItemId', requireAuth, async (c) => {
  const clerkId = c.get('userId') as string
  const { storeItemId } = c.req.param()

  const body   = await c.req.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success)
    return c.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, 400)

  const user = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'Usuario no encontrado' }, 404)

  const item = await StoreItem.findById(storeItemId)
  if (!item) return c.json({ error: 'Carta no encontrada' }, 404)

  const existing = await Review.findOne({ storeItem: storeItemId, author: user._id })
  if (existing)
    return c.json({ error: 'Ya dejaste una reseña para esta carta' }, 409)

  const review = await Review.create({
    storeItem: storeItemId,
    author:    user._id,
    rating:    parsed.data.rating,
    comment:   parsed.data.comment,
  })
  await review.populate('author', 'displayName avatarUrl clerkId')
  return c.json(review, 201)
})

// ─── DELETE /api/reviews/:reviewId (auth, dueño o admin) ─────────────────────
reviewRoutes.delete('/:reviewId', requireAuth, async (c) => {
  const clerkId = c.get('userId') as string
  const { reviewId } = c.req.param()

  const user = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'Usuario no encontrado' }, 404)

  const review = await Review.findById(reviewId)
  if (!review) return c.json({ error: 'Reseña no encontrada' }, 404)

  const isOwner = review.author?.toString() === user._id.toString()
  const isAdmin = (user as any).role === 'admin'
  if (!isOwner && !isAdmin)
    return c.json({ error: 'No autorizado' }, 403)

  await review.deleteOne()
  return c.json({ success: true })
})

// ─── GET /api/reviews/me (mis reseñas) ────────────────────────────────────────
reviewRoutes.get('/me', requireAuth, async (c) => {
  const clerkId = c.get('userId') as string
  const user    = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'Usuario no encontrado' }, 404)

  const reviews = await Review.find({ author: user._id })
    .populate('storeItem', 'catalogCard price condition')
    .sort({ createdAt: -1 })
    .lean()

  return c.json({ reviews })
})