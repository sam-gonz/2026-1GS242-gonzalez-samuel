import { Hono } from 'hono'
import { requireAuth } from '../lib/clerk.js'
import { User, Offer, Transaction } from '@tradeup/db'

export const notificationRoutes = new Hono()

/**
 * GET /api/notifications/summary
 * Returns counts for the navbar badge:
 *  - pendingOffers: offers received as seller, waiting for response
 *  - pendingOrders: orders pending shipping
 */
notificationRoutes.get('/summary', requireAuth, async (c) => {
  const clerkId = c.get('userId')

  const user = await User.findOne({ clerkId }).select('_id').lean()
  if (!user) return c.json({ pendingOffers: 0, pendingOrders: 0, total: 0 })

  const [pendingOffers, pendingOrders] = await Promise.all([
    // Ofertas recibidas como vendedor que aun no han sido respondidas
    Offer.countDocuments({ seller: user._id, status: 'pending' }),
    // Ordenes del comprador aun en pending
    Transaction.countDocuments({ buyer: user._id, status: 'pending' }),
  ])

  return c.json({ pendingOffers, pendingOrders, total: pendingOffers + pendingOrders })
})
