import type { BattlePokemon } from './damage'

export type StatusName = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze'

// Aplicar estado a un Pokémon (si no tiene ya uno)
export function applyStatus(pokemon: BattlePokemon, statusName: StatusName): string | null {
  if (pokemon.status) return null // ya tiene estado
  pokemon.status = { name: statusName, remainingTurns: 3 }
  return statusName
}

// Aplicar daño pasivo al final del turno
export function applyPassiveStatusDamage(pokemon: BattlePokemon): number {
  if (!pokemon.status) return 0

  let dmg = 0
  if (pokemon.status.name === 'burn' || pokemon.status.name === 'poison') {
    dmg = Math.floor(pokemon.maxHp * 0.05)
    pokemon.currentHp = Math.max(0, pokemon.currentHp - dmg)
  }

  pokemon.status.remainingTurns -= 1
  if (pokemon.status.remainingTurns <= 0) {
    pokemon.status = null
  }

  return dmg
}

// Eliminar estado y modificadores al cambiar Pokémon
export function clearStatusOnSwitch(pokemon: BattlePokemon): void {
  pokemon.status = null
  pokemon.statStages = { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
}

// Velocidad efectiva considerando parálisis
export function effectiveSpeed(pokemon: BattlePokemon): number {
  const base = Math.floor(
    pokemon.battleStats.speed * stageMultiplier(pokemon.statStages.speed)
  )
  return pokemon.status?.name === 'paralysis' ? Math.floor(base / 2) : base
}

function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}
