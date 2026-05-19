import { Move } from '../models/move.model'
import { Battle } from '../models/battle.model'
import { calculateDamage } from './damage'
import { applyPassiveStatusDamage, clearStatusOnSwitch, effectiveSpeed, applyStatus } from './status'
import type { BattlePokemon } from './damage'

interface Action {
  type: 'move' | 'switch'
  moveId?: string
  pokemonId?: number
}

interface PlayerState {
  name: string
  team: BattlePokemon[]
  activePokemonId: number
  selectedAction: Action | null
}

function getActive(player: PlayerState): BattlePokemon {
  return player.team.find((p) => p.pokedexId === player.activePokemonId)!
}

function coinFlip(): number {
  return Math.random() < 0.5 ? 0 : 1
}

// Determinar orden de acción entre dos jugadores
async function resolveOrder(
  players: PlayerState[],
  moves: (any | null)[]
): Promise<[number, number]> {
  const [a0, a1] = players.map((p) => p.selectedAction!)

  const getPriority = (action: Action, move: any | null) => {
    if (action.type === 'switch') return 6
    return move?.priority ?? 0
  }

  const p0 = getPriority(a0, moves[0])
  const p1 = getPriority(a1, moves[1])

  if (p0 !== p1) return p0 > p1 ? [0, 1] : [1, 0]

  const spd0 = effectiveSpeed(getActive(players[0]))
  const spd1 = effectiveSpeed(getActive(players[1]))

  if (spd0 !== spd1) return spd0 > spd1 ? [0, 1] : [1, 0]

  return coinFlip() === 0 ? [0, 1] : [1, 0]
}

export async function resolveTurn(roomCode: string): Promise<string[]> {
  const battle = await Battle.findOne({ roomCode })
  if (!battle || battle.status !== 'active') throw new Error('Battle not active')

  const players = battle.players as unknown as PlayerState[]
  const log: string[] = []

  // Cargar moves de ambos jugadores
  const moveData = await Promise.all(
    players.map(async (p) => {
      if (p.selectedAction?.type === 'move') {
        return Move.findOne({ name: p.selectedAction.moveId }).lean()
      }
      return null
    })
  )

  const order = await resolveOrder(players, moveData)

  for (const idx of order) {
    const attacker = players[idx]
    const defender = players[idx === 0 ? 1 : 0]
    const action   = attacker.selectedAction!
    const activePokemon = getActive(attacker)

    if (activePokemon.currentHp <= 0) continue // ya debilitado

    // --- SWITCH ---
    if (action.type === 'switch' && action.pokemonId) {
      const next = attacker.team.find((p) => p.pokedexId === action.pokemonId && p.currentHp > 0)
      if (next) {
        clearStatusOnSwitch(activePokemon)
        attacker.activePokemonId = next.pokedexId
        log.push(`${attacker.name} switchó a ${next.name}.`)
      }
      continue
    }

    // --- MOVE ---
    const move = moveData[idx]
    if (!move) continue

    // Precisión
    const accuracy = move.accuracy ?? 100
    const hit = Math.floor(Math.random() * 100) + 1 <= accuracy
    if (!hit) {
      log.push(`${activePokemon.name} usó ${move.name}. ¡Falló!`)
      continue
    }

    const defActive = getActive(defender)
    const { damage, effectiveness, isCritical } = await calculateDamage(activePokemon, defActive, move as any)

    defActive.currentHp = Math.max(0, defActive.currentHp - damage)

    let msg = `${activePokemon.name} usó ${move.name} contra ${defActive.name} (-${damage} HP).`
    if (isCritical)              msg += ' ¡Golpe crítico!'
    if (effectiveness === 'super')    msg += ' ¡Es super efectivo!'
    if (effectiveness === 'resisted') msg += ' No es muy efectivo...'
    if (effectiveness === 'immune')   msg += ' No tiene efecto.'
    log.push(msg)

    // Aplicar efecto de estado si el move lo tiene
    if (move.damageClass !== 'status' && move.effect) {
      const effectLower = move.effect.toLowerCase()
      if (effectLower.includes('burn'))      applyStatus(defActive, 'burn')
      if (effectLower.includes('poison'))    applyStatus(defActive, 'poison')
      if (effectLower.includes('paralysis') || effectLower.includes('paralyze')) applyStatus(defActive, 'paralysis')
    }

    if (defActive.currentHp <= 0) {
      log.push(`${defActive.name} se debilitó.`)
    }
  }

  // Daño pasivo por estado al final del turno
  for (const player of players) {
    const active = getActive(player)
    if (active.currentHp <= 0) continue
    const dmg = applyPassiveStatusDamage(active)
    if (dmg > 0) log.push(`${active.name} sufrió ${dmg} HP de daño por estado.`)
    if (active.currentHp <= 0) log.push(`${active.name} se debilitó por el estado.`)
  }

  // Resetear acciones
  players.forEach((p) => (p.selectedAction = null))

  // Verificar victoria
  for (const player of players) {
    const allFainted = player.team.every((p) => p.currentHp <= 0)
    if (allFainted) {
      const winner = players.find((p) => p.name !== player.name)!
      battle.status = 'ended'
      battle.winnerPlayerId = winner.name
      log.push(`¡${winner.name} ganó la batalla!`)
    }
  }

  // Persistir estado actualizado
  battle.turn += 1
  battle.players = players as any
  battle.battleLog.push(...log.map((message) => ({ turn: battle.turn - 1, message })))
  await battle.save()

  return log
}
