import { Hono } from 'hono'
import { requireAuth } from '../lib/clerk.js'
import { Message, Transaction, User } from '@tradeup/db'

export const chatRoutes = new Hono()

// GET /api/chat/:transactionId  — get messages (polling)
chatRoutes.get('/:transactionId', requireAuth, async (c) => {
  const { transactionId } = c.req.param()
  const clerkId = c.get('userId')

  const user = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'User not synced' }, 400)

  const tx = await Transaction.findById(transactionId)
  if (!tx) return c.json({ error: 'Transaction not found' }, 404)

  const isMember =
    String(tx.buyer) === String(user._id) ||
    String(tx.seller) === String(user._id)
  if (!isMember) return c.json({ error: 'Forbidden' }, 403)

  const messages = await Message.find({ transaction: transactionId })
    .populate('sender', 'username')
    .sort({ createdAt: 1 })
    .lean()

  // Mark unread as read
  await Message.updateMany(
    { transaction: transactionId, readBy: { $ne: user._id } },
    { $addToSet: { readBy: user._id } },
  )

  return c.json({ messages })
})

// POST /api/chat/:transactionId  — send message
chatRoutes.post('/:transactionId', requireAuth, async (c) => {
  const { transactionId } = c.req.param()
  const clerkId = c.get('userId')

  const user = await User.findOne({ clerkId })
  if (!user) return c.json({ error: 'User not synced' }, 400)

  const tx = await Transaction.findById(transactionId)
  if (!tx) return c.json({ error: 'Transaction not found' }, 404)

  const isMember =
    String(tx.buyer) === String(user._id) ||
    String(tx.seller) === String(user._id)
  if (!isMember) return c.json({ error: 'Forbidden' }, 403)

  const { text } = await c.req.json()
  if (!text || typeof text !== 'string' || !text.trim()) {
    return c.json({ error: 'text is required' }, 400)
  }

  const msg = await Message.create({
    transaction: transactionId,
    sender: user._id,
    text: text.trim().slice(0, 2000),
    readBy: [user._id],
  })

  const populated = await msg.populate('sender', 'username')
  return c.json({ message: populated }, 201)
})
