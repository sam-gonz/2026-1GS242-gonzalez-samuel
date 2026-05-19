import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'
import { Room } from '../models/room.model'
import { Battle } from '../models/battle.model'
import { Pokemon } from '../models/pokemon.model'
import { Move } from '../models/move.model'

const rooms = new Hono()
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

// --- Helpers ---

function randomIV() {
  return Math.floor(Math.random() * 32) // 0-31
}

function calcHp(base: number, iv: number) {
  return Math.floor((2 * base + iv) * 50 / 100) + 50 + 10
}

function calcStat(base: number, iv: number) {
  return Math.floor((2 * base + iv) * 50 / 100) + 5
}

// --- Routes ---

// POST /api/rooms
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

// POST /api/rooms/:code/join
rooms.post('/:code/join', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase()
    const { name } = await c.req.json()
    if (!name) return c.json({ error: 'Player name is required' }, 400)

    const room = await Room.findOne({ code })
    if (!room)                     return c.json({ error: 'Room not found' }, 404)
    if (room.status !== 'waiting') return c.json({ error: 'Room is not open' }, 400)
    if (room.players.length >= 2)  return c.json({ error: 'Room is full' }, 400)

    room.players.push({ name, ready: false })
    room.status = 'selecting'
    await room.save()

    return c.json({ code: room.code, status: room.status, players: room.players })
  } catch (err) {
    return c.json({ error: 'Failed to join room' }, 500)
  }
})

// GET /api/rooms/:code
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

// POST /api/rooms/:code/team
// Body: { playerName: string, team: number[] } (array de pokedexIds, max 6)
rooms.post('/:code/team', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase()
    const { playerName, team: pokedexIds } = await c.req.json()

    if (!playerName)                               return c.json({ error: 'playerName is required' }, 400)
    if (!Array.isArray(pokedexIds) || pokedexIds.length < 1 || pokedexIds.length > 6)
      return c.json({ error: 'Team must have 1-6 Pokémon' }, 400)

    const room = await Room.findOne({ code })
    if (!room)                       return c.json({ error: 'Room not found' }, 404)
    if (room.status !== 'selecting') return c.json({ error: 'Room is not in selecting phase' }, 400)

    const playerIndex = room.players.findIndex((p) => p.name === playerName)
    if (playerIndex === -1) return c.json({ error: 'Player not in room' }, 404)

    // Cargar Pokémon desde MongoDB
    const pokemonDocs = await Pokemon.find({ pokedexId: { $in: pokedexIds } }).lean()
    if (pokemonDocs.length !== pokedexIds.length)
      return c.json({ error: 'One or more Pokémon not found in DB' }, 400)

    // Construir equipo de batalla con IVs y stats calculados
    const battleTeam = pokemonDocs.map((p) => {
      const ivs = {
        hp:             randomIV(),
        attack:         randomIV(),
        defense:        randomIV(),
        specialAttack:  randomIV(),
        specialDefense: randomIV(),
        speed:          randomIV(),
      }
      const maxHp = calcHp(p.baseStats.hp, ivs.hp)

      // Tomar hasta 4 moveIds válidos
      const moveNames = p.moveIds.slice(0, 4)
      if (moveNames.length < 4) {
        // documentado: Pokémon con menos de 4 moves se excluyen en producción
        // para el parcial los rellenamos con los disponibles
      }

      return {
        pokedexId:  p.pokedexId,
        name:       p.name,
        types:      p.types,
        spriteUrl:  p.spriteUrl,
        currentHp:  maxHp,
        maxHp,
        battleStats: {
          attack:         calcStat(p.baseStats.attack,         ivs.attack),
          defense:        calcStat(p.baseStats.defense,        ivs.defense),
          specialAttack:  calcStat(p.baseStats.specialAttack,  ivs.specialAttack),
          specialDefense: calcStat(p.baseStats.specialDefense, ivs.specialDefense),
          speed:          calcStat(p.baseStats.speed,          ivs.speed),
        },
        ivs,
        statStages: { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
        status:     null,
        moveNames,
      }
    })

    // Marcar jugador como listo
    room.players[playerIndex].ready = true
    await room.save()

    // Verificar si ambos jugadores enviaron equipo
    let battle = await Battle.findOne({ roomCode: code })

    if (!battle) {
      // Primer jugador — crear documento de batalla parcial
      battle = await Battle.create({
        roomCode: code,
        turn: 1,
        status: 'selecting',
        players: [{ name: playerName, team: battleTeam, activePokemonId: battleTeam[0].pokedexId, selectedAction: null }],
        battleLog: [],
        winnerPlayerId: null,
      })
    } else {
      // Segundo jugador — agregar equipo e iniciar batalla
      battle.players.push({ name: playerName, team: battleTeam, activePokemonId: battleTeam[0].pokedexId, selectedAction: null })
      battle.status = 'active'
      await battle.save()

      room.status = 'battle'
      await room.save()
    }

    return c.json({ message: 'Team saved', battleStatus: battle.status })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to save team' }, 500)
  }
})

export default rooms
