import { Hono } from 'hono'
import { User } from '../models/user.model'

const users = new Hono()

users.get('/:clerkId', async (c) => {
  const { clerkId } = c.req.param()
  const user = await User.findOne({ clerkId })
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  return c.json(user)
})

users.post('/', async (c) => {
  const body = await c.req.json()
  const { clerkId, name, email } = body

  if (!clerkId || !name || !email) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    { clerkId, name, email },
    { upsert: true, new: true }
  )

  return c.json(user)
})

users.patch('/:clerkId/shinies', async (c) => {
  const { clerkId } = c.req.param()
  const body = await c.req.json()
  const { pokedexIds, packId } = body

  const update: Record<string, unknown> = {}
  if (pokedexIds && Array.isArray(pokedexIds)) {
    update.$addToSet = { unlockedShinies: { $each: pokedexIds } }
  }
  if (packId) {
    update.$addToSet = { purchasedPacks: packId }
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    update,
    { new: true }
  )

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user)
})

export default users