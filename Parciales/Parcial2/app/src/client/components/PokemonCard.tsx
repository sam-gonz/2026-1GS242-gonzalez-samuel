import TypeBadge from './TypeBadge'
import StatusBadge from './StatusBadge'
import HealthBar from './HealthBar'

interface BattlePokemon {
  pokedexId: number
  name: string
  types: string[]
  spriteUrl: string
  currentHp: number
  maxHp: number
  status: { name: string; remainingTurns: number } | null
}

interface Props {
  pokemon: BattlePokemon
  isOpponent?: boolean
  isActive?: boolean
  animClass?: string
}

export default function PokemonCard({ pokemon, isOpponent = false, isActive = false, animClass = '' }: Props) {
  const isFainted = pokemon.currentHp <= 0

  return (
    <div className={`pokemon-slot ${isActive ? 'pokemon-slot--active' : ''} ${isFainted ? 'pokemon-slot--fainted' : ''}`}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: isActive ? 'var(--accent)' : 'var(--text-muted)', alignSelf: 'flex-start' }}>
        {isOpponent ? 'OPONENTE' : 'TU POKÉMON'}
      </span>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
      </div>

      <img
        src={pokemon.spriteUrl}
        alt={pokemon.name}
        className={`pokemon-sprite ${isOpponent ? 'pokemon-sprite--opponent' : ''} ${animClass}`}
      />

      <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', textTransform: 'capitalize', color: 'var(--text)' }}>
        {pokemon.name}
      </span>

      <StatusBadge status={pokemon.status} />
      <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} />
    </div>
  )
}
