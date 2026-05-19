import { Hono } from 'hono'
import { Battle } from '../models/battle.model'
import { resolveTurn } from '../engine/turn'

const battle = new Hono()

// GET /api/battle/:code — estado actual de la batalla
battle.get('/:code', async (c) => {
  try {
    const roomCode = c.req.param('code').toUpperCase()
    const doc = await Battle.findOne({ roomCode }).lean()
    if (!doc) return c.json({ error: 'Battle not found' }, 404)
    return c.json(doc)
  } catch (err) {
    return c.json({ error: 'Failed to get battle' }, 500)
  }
})

// POST /api/battle/:code/action
// Body: { playerName: string, action: { type: 'move'|'switch', moveId?: string, pokemonId?: number } }
battle.post('/:code/action', async (c) => {
  try {
    const roomCode = c.req.param('code').toUpperCase()
    const { playerName, action } = await c.req.json()

    if (!playerName || !action?.type)
      return c.json({ error: 'playerName and action are required' }, 400)
    if (!['move', 'switch'].includes(action.type))
      return c.json({ error: 'action.type must be move or switch' }, 400)
    if (action.type === 'move' && !action.moveId)
      return c.json({ error: 'moveId is required for move actions' }, 400)
    if (action.type === 'switch' && !action.pokemonId)
      return c.json({ error: 'pokemonId is required for switch actions' }, 400)

    const doc = await Battle.findOne({ roomCode })
    if (!doc)                       return c.json({ error: 'Battle not found' }, 404)
    if (doc.status !== 'active')    return c.json({ error: 'Battle is not active' }, 400)

    const players = doc.players as any[]
    const playerIdx = players.findIndex((p: any) => p.name === playerName)
    if (playerIdx === -1)           return c.json({ error: 'Player not in battle' }, 404)

    const player = players[playerIdx]

    // Validar que no haya enviado acción ya en este turno
    if (player.selectedAction !== null)
      return c.json({ error: 'Action already submitted this turn' }, 400)

    // Validar Pokémon activo vivo
    const active = player.team.find((p: any) => p.pokedexId === player.activePokemonId)
    if (!active || active.currentHp <= 0)
      return c.json({ error: 'Active Pokémon is fainted' }, 400)

    // Validar movimiento pertenece al Pokémon
    if (action.type === 'move' && !active.moveNames.includes(action.moveId))
      return c.json({ error: 'Move does not belong to active Pokémon' }, 400)

    // Validar switch: el Pokémon destino debe estar vivo y en el equipo
    if (action.type === 'switch') {
      const target = player.team.find((p: any) => p.pokedexId === action.pokemonId)
      if (!target)                  return c.json({ error: 'Target Pokémon not in team' }, 400)
      if (target.currentHp <= 0)    return c.json({ error: 'Target Pokémon is fainted' }, 400)
      if (target.pokedexId === player.activePokemonId)
        return c.json({ error: 'Target is already active' }, 400)
    }

    // Registrar acción
    players[playerIdx].selectedAction = action
    doc.players = players
    await doc.save()

    // Si ambos jugadores enviaron acción → resolver turno
    const bothReady = players.every((p: any) => p.selectedAction !== null)
    if (bothReady) {
      const log = await resolveTurn(roomCode)
      return c.json({ message: 'Turn resolved', log })
    }

    return c.json({ message: 'Action registered, waiting for opponent' })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to process action' }, 500)
  }
})

export default battle
