import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'
import { Room } from '../models/room.model'
import { Battle } from '../models/battle.model'

const rooms = new Hono()
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

// POST /api/rooms — crear sala
rooms.post('/', async (c) => {
  try {
    const { name } = await c.req.json()
    if (!name) return c.json({ error: 'Player name is required' }, 400)

    let code: string
    let exists = true
    do {
      code = nanoid()
      exists = !!(await Room.findOne({ code }))
    } while (exists)

    const room = await Room.create({
      code,
      status: 'waiting',
      players: [{ name, ready: false }],
    })

    return c.json({ code: room.code, status: room.status, players: room.players }, 201)
  } catch (err) {
    return c.json({ error: 'Failed to create room' }, 500)
  }
})

// POST /api/rooms/:code/join — unirse a sala
rooms.post('/:code/join', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase()
    const { name } = await c.req.json()
    if (!name) return c.json({ error: 'Player name is required' }, 400)

    const room = await Room.findOne({ code })
    if (!room)                         return c.json({ error: 'Room not found' }, 404)
    if (room.status !== 'waiting')     return c.json({ error: 'Room is not open' }, 400)
    if (room.players.length >= 2)      return c.json({ error: 'Room is full' }, 400)

    room.players.push({ name, ready: false })
    room.status = 'selecting'
    await room.save()

    return c.json({ code: room.code, status: room.status, players: room.players })
  } catch (err) {
    return c.json({ error: 'Failed to join room' }, 500)
  }
})

// GET /api/rooms/:code — estado de la sala
rooms.get('/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase()
    const room = await Room.findOne({ code }).lean()
    if (!room) return c.json({ error: 'Room not found' }, 404)
    return c.json(room)
  } catch (err) {
    return c.json({ error: 'Failed to get room' }, 500)
  }
})

export default rooms
