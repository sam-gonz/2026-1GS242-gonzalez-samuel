import { Hono } from 'hono'
import { requireAdmin, clerkClient } from '../lib/clerk.js'
import { User, Transaction, Offer, Listing } from '@tradeup/db'

export const adminRoutes = new Hono()

// ─── GET /api/admin/metrics ────────────────────────────────────────────────────
adminRoutes.get('/metrics', requireAdmin, async (c) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [totalTransactions, monthlyTransactions, revenueAgg, activeUsers, pendingOffers, totalListings, bannedUsers, newUsersMonth] =
    await Promise.all([
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.countDocuments({ status: 'completed', createdAt: { $gte: startOfMonth } }),
      Transaction.aggregate([
        { $match: { status: 'completed', commissionAmount: { $gt: 0 } } },
        { $group: { _id: null,
          total: { $sum: '$commissionAmount' },
          monthly: { $sum: { $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$commissionAmount', 0] } },
          lastMonth: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', startOfLastMonth] }, { $lt: ['$createdAt', startOfMonth] }] }, '$commissionAmount', 0] } },
          totalGross: { $sum: '$grossAmount' },
          monthlyGross: { $sum: { $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$grossAmount', 0] } },
        }},
      ]),
      User.countDocuments({ isBanned: false }),
      Offer.countDocuments({ status: 'pending' }),
      Listing.countDocuments({ status: 'active' }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ])

  const revenue = revenueAgg[0] ?? { total: 0, monthly: 0, lastMonth: 0, totalGross: 0, monthlyGross: 0 }

  return c.json({
    transactions: { total: totalTransactions, thisMonth: monthlyTransactions },
    revenue: {
      commission: { total: revenue.total, thisMonth: revenue.monthly, lastMonth: revenue.lastMonth },
      gross: { total: revenue.totalGross, thisMonth: revenue.monthlyGross },
    },
    activeUsers,
    bannedUsers,
    newUsersMonth,
    pendingOffers,
    activeListings: totalListings,
  })
})

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
adminRoutes.get('/users', requireAdmin, async (c) => {
  const { page = '1', search, role } = c.req.query()
  const pageNum = Math.max(Number(page) || 1, 1)

  const filter: Record<string, unknown> = {}
  if (role) filter['role'] = role
  if (search) {
    filter['$or'] = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-__v').sort({ createdAt: -1 }).skip((pageNum - 1) * 20).limit(20),
    User.countDocuments(filter),
  ])

  return c.json({ users, total, page: pageNum })
})

// ─── PATCH /api/admin/users/:id/ban ────────────────────────────────────────────
adminRoutes.patch('/users/:id/ban', requireAdmin, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json<{ banned: boolean }>()

  const user = await User.findByIdAndUpdate(id, { isBanned: body.banned ?? true }, { new: true })
  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({
    message: user.isBanned ? 'User banned' : 'User unbanned',
    user: { id: user._id, username: user.username, isBanned: user.isBanned },
  })
})

// ─── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
adminRoutes.patch('/users/:id/role', requireAdmin, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json<{ role: 'buyer' | 'seller' | 'admin' }>()

  const validRoles = ['buyer', 'seller', 'admin']
  if (!validRoles.includes(body.role)) {
    return c.json({ error: 'Invalid role. Must be buyer, seller, or admin' }, 400)
  }

  const user = await User.findByIdAndUpdate(id, { role: body.role }, { new: true })
  if (!user) return c.json({ error: 'User not found' }, 404)

  try {
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { role: body.role },
    })
  } catch (err) {
    console.error('Failed to sync role to Clerk:', err)
  }

  return c.json({ message: `Role updated to ${body.role}`, user: { id: user._id, username: user.username, role: user.role } })
})

// ─── PATCH /api/admin/transactions/:id/shipping ───────────────────────────────
adminRoutes.patch('/transactions/:id/shipping', requireAdmin, async (c) => {
  const { id } = c.req.param()
  const { shippingStatus } = await c.req.json<{ shippingStatus: string }>()

  const valid = ['pending', 'preparing', 'shipped', 'delivered']
  if (!valid.includes(shippingStatus)) return c.json({ error: 'Invalid shippingStatus' }, 400)

  const tx = await Transaction.findByIdAndUpdate(id, { shippingStatus }, { new: true })
  if (!tx) return c.json({ error: 'Transaction not found' }, 404)

  return c.json({ transaction: tx })
})

// ─── GET /api/admin/listings ───────────────────────────────────────────────────
adminRoutes.get('/listings', requireAdmin, async (c) => {
  const { page = '1', status, search } = c.req.query()
  const pageNum = Math.max(Number(page) || 1, 1)

  const filter: Record<string, unknown> = {}
  if (status) filter['status'] = status

  let listings: any[]
  let total: number

  if (search) {
    const all = await Listing.find(filter)
      .populate('catalogCard', 'name game rarity')
      .populate('seller', 'username email')
      .sort({ createdAt: -1 })
    const filtered = all.filter((l: any) =>
      l.catalogCard?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.seller?.username?.toLowerCase().includes(search.toLowerCase())
    )
    total = filtered.length
    listings = filtered.slice((pageNum - 1) * 20, pageNum * 20)
  } else {
    ;[listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('catalogCard', 'name game rarity imageUrl')
        .populate('seller', 'username email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * 20)
        .limit(20),
      Listing.countDocuments(filter),
    ])
  }

  return c.json({ listings, total, page: pageNum })
})

// ─── DELETE /api/admin/listings/:id ───────────────────────────────────────────
adminRoutes.delete('/listings/:id', requireAdmin, async (c) => {
  const { id } = c.req.param()
  const listing = await Listing.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
  if (!listing) return c.json({ error: 'Listing not found' }, 404 )
  return c.json({ message: 'Listing cancelled by admin', listing })
})
