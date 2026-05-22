import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ShinyCard from '../components/ShinyCard'
import AnimatedBg from '../components/AnimatedBg'

interface Pokemon {
  pokedexId: number
  name: string
  types: string[]
  spriteUrl: string
  isShiny: boolean
  rarity: string
  price: number
}

type RarityFilter = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
const PACKS = [
  {
    id: 'shiny-pack-5',
    name: 'Shiny Pack (5 Pokémon)',
    description: '5 Random Shinies guaranteed',
    price: 499,
    icon: '✨',
  },
]

export default function Shop() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [ownedShinies, setOwnedShinies] = useState<number[]>([])
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState<number | string | null>(null)
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCanceled, setShowCanceled] = useState(false)

  useEffect(() => {
    if (searchParams.get('success')) setShowSuccess(true)
    if (searchParams.get('canceled')) setShowCanceled(true)
    const timer = setTimeout(() => {
      setShowSuccess(false)
      setShowCanceled(false)
      navigate('/shop', { replace: true })
    }, 4000)
    return () => clearTimeout(timer)
  }, [searchParams, navigate])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      navigate('/login')
      return
    }

    async function fetchData() {
      setLoading(true)
      try {
        const userId = user?.id
        if (!userId) {
          setLoading(false)
          return
        }

        const [pokemonRes, userRes] = await Promise.all([
          fetch('/api/shiny?limit=150'),
          fetch(`/api/payments/user-shinies/${userId}`),
        ])

        const pokemonData = await pokemonRes.json()
        const userData = await userRes.json()

        setPokemon(pokemonData.data || [])
        setOwnedShinies(userData.unlockedShinies || [])
        setPurchasedPacks(userData.purchasedPacks || [])
      } catch (err) {
        console.error('Failed to load shop data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, isSignedIn, navigate])

  async function handleBuy(pokedexId: number) {
    if (!user) return
    setBuyingId(pokedexId)
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id, pokedexId }),
      })
      const data = await res.json()
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        alert('Error creating checkout session')
      }
    } catch (err) {
      console.error('Purchase failed:', err)
    } finally {
      setBuyingId(null)
    }
  }

  async function handleBuyPack(packId: string) {
    if (!user) return
    setBuyingId(packId)
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id, packId }),
      })
      const data = await res.json()
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (err) {
      console.error('Purchase failed:', err)
    } finally {
      setBuyingId(null)
    }
  }

  const filteredPokemon = rarityFilter === 'all'
    ? pokemon
    : pokemon.filter((p) => p.rarity === rarityFilter)

  const ownedCount = ownedShinies.length
  const totalShiny = pokemon.length

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          color: 'var(--accent)',
          animation: 'glow-pulse 1.5s ease-in-out infinite',
        }}>
          CARGANDO TIENDA...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBg />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '8px',
                color: 'var(--text-muted)',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              ← VOLVER
            </button>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(12px, 2vw, 18px)',
              color: 'var(--accent)',
              marginBottom: '0',
              textShadow: '0 0 20px rgba(255,215,0,0.4)',
            }}>
              TIENDA SHINY
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {RARITY_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '7px',
                  padding: '0.4rem 0.8rem',
                  background: rarityFilter === r ? 'var(--accent)' : 'transparent',
                  color: rarityFilter === r ? '#0a0a0f' : 'var(--text-muted)',
                  border: `1px solid ${rarityFilter === r ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => setRarityFilter('all')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '7px',
                padding: '0.4rem 0.8rem',
                background: rarityFilter === 'all' ? 'var(--accent)' : 'transparent',
                color: rarityFilter === 'all' ? '#0a0a0f' : 'var(--text-muted)',
                border: `1px solid ${rarityFilter === 'all' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              TODOS
            </button>
          </div>
        </div>

        {showSuccess && (
          <div style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.3s ease',
          }}>
            <span style={{ fontSize: '20px' }}>🎉</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '9px', color: '#22c55e', marginBottom: '0.25rem' }}>
                ¡COMPRA EXITOSA!
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Tu shiny ha sido desbloqueado. Ya está disponible en tu colección.
              </p>
            </div>
          </div>
        )}

        {showCanceled && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--red)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Compra cancelada. Puedes intentar de nuevo cuando quieras.
            </p>
          </div>
        )}

        <div style={{
          background: 'rgba(16,16,26,0.8)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '10px',
            color: 'var(--accent)',
            marginBottom: '1rem',
            letterSpacing: '0.1em',
          }}>
            PACKS ESPECIALES
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {PACKS.map((pack) => {
              const owned = purchasedPacks.includes(pack.id)
              return (
                <div
                  key={pack.id}
                  style={{
                    background: 'rgba(20,20,31,0.9)',
                    border: `1px solid ${owned ? '#22c55e' : 'var(--border)'}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: owned ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '32px' }}>{pack.icon}</span>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '8px',
                        color: 'var(--accent)',
                        marginBottom: '0.3rem',
                      }}>
                        {pack.name}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {pack.description}
                      </p>
                    </div>
                  </div>
                  {owned ? (
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '8px',
                      color: '#22c55e',
                      textAlign: 'center',
                      padding: '0.5rem',
                      border: '1px solid #22c55e',
                      borderRadius: '4px',
                    }}>
                      ✓ COMPRADO
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyPack(pack.id)}
                      disabled={buyingId === pack.id}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '8px',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#0a0a0f',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: buyingId === pack.id ? 'not-allowed' : 'pointer',
                        opacity: buyingId === pack.id ? 0.6 : 1,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {buyingId === pack.id ? 'CARGANDO...' : `$${(pack.price / 100).toFixed(2)} USD`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '10px',
            color: 'var(--accent)',
            marginBottom: '1rem',
            letterSpacing: '0.1em',
          }}>
            POKEMON SHINY
          </h2>
          {filteredPokemon.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '9px',
            }}>
              NO HAY SHINIES EN ESTA CATEGORIA
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem',
            }}>
              {filteredPokemon.map((p) => (
                <ShinyCard
                  key={p.pokedexId}
                  {...p}
                  isOwned={ownedShinies.includes(p.pokedexId)}
                  onBuy={handleBuy}
                  loading={buyingId === p.pokedexId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}