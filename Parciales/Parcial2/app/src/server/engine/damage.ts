import { TypeChart } from '../models/typechart.model'

// Multiplicador de efectividad por tipo
export async function getTypeMultiplier(moveType: string, defenderTypes: string[]): Promise<number> {
  const chart = await TypeChart.findOne({ attackingType: moveType }).lean()
  if (!chart) return 1

  let multiplier = 1
  for (const defType of defenderTypes) {
    if (chart.noDamageTo.includes(defType))     multiplier *= 0
    else if (chart.doubleDamageTo.includes(defType)) multiplier *= 2
    else if (chart.halfDamageTo.includes(defType))   multiplier *= 0.5
  }
  return multiplier
}

// Modificador de stage (-6 a +6)
export function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}

export interface MoveData {
  name: string
  type: string
  power: number | null
  accuracy: number | null
  priority: number
  damageClass: 'physical' | 'special' | 'status'
  effect: string | null
}

export interface BattlePokemon {
  pokedexId: number
  name: string
  types: string[]
  currentHp: number
  maxHp: number
  battleStats: {
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
  statStages: {
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
  status: { name: string; remainingTurns: number } | null
  moveNames: string[]
}

export async function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: MoveData
): Promise<{ damage: number; typeMultiplier: number; isCritical: boolean; effectiveness: string }> {
  if (move.damageClass === 'status' || !move.power) {
    return { damage: 0, typeMultiplier: 1, isCritical: false, effectiveness: 'normal' }
  }

  // Elegir stats según categoría
  const attackStat = move.damageClass === 'physical'
    ? Math.floor(attacker.battleStats.attack   * stageMultiplier(attacker.statStages.attack))
    : Math.floor(attacker.battleStats.specialAttack * stageMultiplier(attacker.statStages.specialAttack))

  const defenseStat = move.damageClass === 'physical'
    ? Math.floor(defender.battleStats.defense  * stageMultiplier(defender.statStages.defense))
    : Math.floor(defender.battleStats.specialDefense * stageMultiplier(defender.statStages.specialDefense))

  // Fórmula base
  const baseDamage = Math.floor(
    Math.floor(Math.floor(2 * 50 / 5 + 2) * move.power * (attackStat / defenseStat)) / 50 + 2
  )

  // Modificadores
  const randomFactor  = (Math.floor(Math.random() * 16) + 85) / 100
  const stab          = attacker.types.includes(move.type) ? 1.5 : 1
  const typeMultiplier = await getTypeMultiplier(move.type, defender.types)
  const isCritical    = Math.random() < 1 / 24
  const critical      = isCritical ? 1.5 : 1
  const burnModifier  = (attacker.status?.name === 'burn' && move.damageClass === 'physical') ? 0.5 : 1

  const modifier = randomFactor * stab * typeMultiplier * critical * burnModifier
  const damage   = Math.max(1, Math.floor(baseDamage * modifier))

  let effectiveness = 'normal'
  if (typeMultiplier === 0)       effectiveness = 'immune'
  else if (typeMultiplier >= 2)   effectiveness = 'super'
  else if (typeMultiplier <= 0.5) effectiveness = 'resisted'

  return { damage, typeMultiplier, isCritical, effectiveness }
}
