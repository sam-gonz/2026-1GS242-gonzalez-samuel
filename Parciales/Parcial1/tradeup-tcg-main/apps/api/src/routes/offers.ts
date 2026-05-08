import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../lib/clerk.js'
import { Offer, Listing, User, Transaction } from '@tradeup/db'
import { getOfferExpiryDate } from '@tradeup/shared'

export const offerRoutes = new Hono()

const createOfferSchema = z.object({
  listingId:    z.string().min(24),
  type:         z.enum(['money', 'cards', 'mixed']),
  moneyAmount:  z.number().int().positive().optional(),
  offeredCards: z.array(z.string().min(24)).optional().default([]),
}).refine((data) => {
  if (data.type === 'money' || data.type === 'mixed') {
    return typeof data.moneyAmount === 'number' && data.moneyAmount > 0
  }
  return true
}, { message: 'moneyAmount is required for money or mixed offers' })
.refine((data) => {
  if (data.type === 'cards' || data.type === 'mixed') {
    return Array.isArray(data.offeredCards) && data.offeredCards.length > 0
  }
  return true
}, { message: 'offeredCards is required for cards or mixed offers' })

// GET /api/offers
offerRoutes.get('/', requireAuth, async (c) => {
  const clerkId = c.get('userId')
  const user = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'User not synced' }, 400)

  const [sent, received] = await Promise.all([
    Offer.find({ buyer: user._id })
      .populate('listing')
      .populate('seller', 'username reputation')
      .sort({ createdAt: -1 }),
    Offer.find({ seller: user._id })
      .populate('listing')
      .populate('buyer', 'username reputation')
      .sort({ createdAt: -1 }),
  ])

  return c.json({ sent, received })
})

// POST /api/offers
offerRoutes.post('/', requireAuth, async (c) => {
  const clerkId = c.get('userId')
  const body = await c.req.json()

  const parsed = createOfferSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { listingId, type, moneyAmount, offeredCards } = parsed.data

  const buyer = await User.findOne({ clerkId })
  if (!buyer) return c.json({ error: 'User not synced. Call /api/auth/sync first.' }, 400)
  if (buyer.isBanned) return c.json({ error: 'Your account has been banned.' }, 403)

  const listing = await Listing.findById(listingId)
  if (!listing) return c.json({ error: 'Listing not found' }, 404)
  if (listing.status !== 'active') return c.json({ error: 'Listing is no longer active' }, 400)
  if (String(listing.seller) === String(buyer._id)) {
    return c.json({ error: 'You cannot make an offer on your own listing' }, 400)
  }

  const seller = await User.findById(listing.seller)
  if (!seller) return c.json({ error: 'Seller not found' }, 404)

  const existingOffer = await Offer.findOne({
    listing: listing._id,
    buyer: buyer._id,
    status: 'pending',
  })
  if (existingOffer) {
    return c.json({ error: 'You already have a pending offer on this listing' }, 409)
  }

  const offer = await Offer.create({
    listing:      listing._id,
    buyer:        buyer._id,
    seller:       seller._id,
    type,
    moneyAmount,
    offeredCards: offeredCards ?? [],
    status:       'pending',
    expiresAt:    getOfferExpiryDate(),
  })

  return c.json({ message: 'Offer created', offer }, 201)
})

// POST /api/offers/:id/accept
offerRoutes.post('/:id/accept', requireAuth, async (c) => {
  const { id } = c.req.param()
  const clerkId = c.get('userId')

  const seller = await User.findOne({ clerkId })
  if (!seller) return c.json({ error: 'User not synced' }, 400)

  const offer = await Offer.findById(id).populate('listing')
  if (!offer) return c.json({ error: 'Offer not found' }, 404)
  if (String(offer.seller) !== String(seller._id)) {
    return c.json({ error: 'Forbidden: you are not the seller of this listing' }, 403)
  }
  if (offer.status !== 'pending') {
    return c.json({ error: `Offer is already ${offer.status}` }, 400)
  }
  if (offer.expiresAt < new Date()) {
    await Offer.findByIdAndUpdate(id, { status: 'expired' })
    return c.json({ error: 'Offer has expired' }, 400)
  }

  const listingId = (offer as any).listing._id ?? (offer as any).listing

  // Declinar todas las demas ofertas pendientes del mismo listing
  await Offer.updateMany(
    { listing: listingId, _id: { $ne: offer._id }, status: 'pending' },
    { status: 'declined' },
  )

  // Marcar listing
  const newListingStatus = offer.type === 'money' ? 'sold' : 'traded'
  await Promise.all([
    Listing.findByIdAndUpdate(listingId, { status: newListingStatus }),
    ...offer.offeredCards.map((lid) => Listing.findByIdAndUpdate(lid, { status: 'traded' })),
  ])

  await Offer.findByIdAndUpdate(id, { status: 'accepted' })

  const txType =
    offer.type === 'cards' ? 'c2c_trade'
    : offer.type === 'mixed' ? 'c2c_mixed'
    : 'c2c_money'

  // status 'pending' = transaccion creada, usuarios coordinan via chat
  const transaction = await Transaction.create({
    offer:          offer._id,
    buyer:          offer.buyer,
    seller:         offer.seller,
    type:           txType,
    grossAmount:    offer.moneyAmount,
    status:         'pending',
    reviewEligible: false,
  })

  return c.json({
    message: 'Offer accepted. Coordinate via chat.',
    transaction,
    chatTransactionId: String(transaction._id),
  })
})

// POST /api/offers/:id/decline
offerRoutes.post('/:id/decline', requireAuth, async (c) => {
  const { id } = c.req.param()
  const clerkId = c.get('userId')

  const seller = await User.findOne({ clerkId })
  if (!seller) return c.json({ error: 'User not synced' }, 400)

  const offer = await Offer.findById(id)
  if (!offer) return c.json({ error: 'Offer not found' }, 404)
  if (String(offer.seller) !== String(seller._id)) return c.json({ error: 'Forbidden' }, 403)
  if (offer.status !== 'pending') return c.json({ error: `Offer is already ${offer.status}` }, 400)

  await Offer.findByIdAndUpdate(id, { status: 'declined' })
  return c.json({ message: 'Offer declined.' })
})

// POST /api/offers/:id/cancel
offerRoutes.post('/:id/cancel', requireAuth, async (c) => {
  const { id } = c.req.param()
  const clerkId = c.get('userId')

  const buyer = await User.findOne({ clerkId })
  if (!buyer) return c.json({ error: 'User not synced' }, 400)

  const offer = await Offer.findById(id)
  if (!offer) return c.json({ error: 'Offer not found' }, 404)
  if (String(offer.buyer) !== String(buyer._id)) return c.json({ error: 'Forbidden: only the buyer can cancel' }, 403)
  if (offer.status !== 'pending') return c.json({ error: `Offer is already ${offer.status}` }, 400)

  await Offer.findByIdAndUpdate(id, { status: 'cancelled' })
  return c.json({ message: 'Offer cancelled.' })
})
