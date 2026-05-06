import { Hono } from 'hono'
import { requireAuth, requireSeller } from '../lib/clerk.js'
import { Listing, CatalogCard, User, Offer } from '@tradeup/db'
import { Types } from 'mongoose'

export const listingRoutes = new Hono()

// GET /api/listings  — public
listingRoutes.get('/', async (c) => {
  const { game, condition, q, page = '1', limit = '20' } = c.req.query()
  const filter: any = { status: 'active' }

  let cardIds: Types.ObjectId[] | undefined
  if (game || q) {
    const cardFilter: any = {}
    if (game) cardFilter.game = game
    if (q) cardFilter.name = { $regex: q, $options: 'i' }
    const cards = await CatalogCard.find(cardFilter).select('_id').lean()
    cardIds = cards.map((c: any) => c._id)
    filter.catalogCard = { $in: cardIds }
  }
  if (condition) filter.condition = condition

  const skip = (Number(page) - 1) * Number(limit)
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('catalogCard', 'name set game rarity cardNumber imageUrl')
      .populate('seller', 'username reputation reviewCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Listing.countDocuments(filter),
  ])

  // Attach topBid for each listing
  const listingIds = listings.map((l: any) => l._id)
  const topBids = await Offer.aggregate([
    { $match: { listing: { $in: listingIds }, status: 'pending', type: { $in: ['money', 'mixed'] } } },
    { $group: { _id: '$listing', topBid: { $max: '$moneyAmount' }, count: { $sum: 1 } } },
  ])
  const bidMap = new Map(topBids.map((b: any) => [b._id.toString(), { topBid: b.topBid, count: b.count }]))

  const enriched = listings.map((l: any) => ({
    ...l,
    ...(bidMap.get(l._id.toString()) ?? { topBid: null, count: 0 }),
  }))

  return c.json({ listings: enriched, total, page: Number(page) })
})

// GET /api/listings/:id  — public
listingRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const listing = await Listing.findById(id)
    .populate('catalogCard', 'name set game rarity cardNumber imageUrl')
    .populate('seller', 'username reputation reviewCount')
    .lean()
  if (!listing) return c.json({ error: 'Not found' }, 404)

  // Top bid for this listing
  const topBidAgg = await Offer.aggregate([
    { $match: { listing: new Types.ObjectId(id), status: 'pending', type: { $in: ['money', 'mixed'] } } },
    { $group: { _id: null, topBid: { $max: '$moneyAmount' }, count: { $sum: 1 } } },
  ])
  const topBid = topBidAgg[0]?.topBid ?? null
  const bidCount = topBidAgg[0]?.count ?? 0

  return c.json({ listing: { ...listing, topBid, bidCount } })
})

// POST /api/listings  — seller only
listingRoutes.post('/', requireSeller, async (c) => {
  const userId = c.get('userId')
  const user = await User.findOne({ clerkId: userId })
  if (!user) return c.json({ error: 'User not synced' }, 400)

  const body = await c.req.json()
  const { catalogCardId, condition, photos, askingPrice, wantsCards } = body

  if (!catalogCardId || !condition) return c.json({ error: 'catalogCardId and condition required' }, 400)

  const listing = await Listing.create({
    seller: user._id,
    catalogCard: catalogCardId,
    condition,
    photos: photos ?? [],
    askingPrice: askingPrice ?? undefined,
    wantsCards: wantsCards ?? [],
  })

  return c.json({ listing }, 201)
})

// DELETE /api/listings/:id  — owner only
listingRoutes.delete('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')
  const user = await User.findOne({ clerkId: userId })
  if (!user) return c.json({ error: 'User not synced' }, 400)

  const listing = await Listing.findById(c.req.param('id'))
  if (!listing) return c.json({ error: 'Not found' }, 404)
  if (listing.seller.toString() !== user._id.toString()) return c.json({ error: 'Forbidden' }, 403)

  listing.status = 'cancelled'
  await listing.save()
  return c.json({ ok: true })
})
