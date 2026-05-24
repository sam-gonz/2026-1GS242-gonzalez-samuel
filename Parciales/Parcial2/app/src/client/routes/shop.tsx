import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ShinyCard from '../components/ShinyCard'
import PixelBg from '../components/PixelBg'
import PackOpeningModal from '../components/PackOpeningModal'

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

  const [pokemon, setPokemon]               = useState<Pokemon[]>([])
  const [ownedShinies, setOwnedShinies]     = useState<number[]>([])
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([])
  const [loading, setLoading]               = useState(true)
  const [buyingId, setBuyingId]             = useState<number | string | null>(null)
  const [buyError, setBuyError]             = useState<string | null>(null)
  const [rarityFilter, setRarityFilter]     = useState<RarityFilter>('all')
  const [showCanceled, setShowCanceled]     = useState(false)
  const [packResults, setPackResults]       = useState<Pokemon[] | null>(null)
  const hasHandledSuccess                   = useRef(false)

  // ─── Effect #1: cargar pokémones + shinies del usuario ───────────────────────
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { navigate('/login'); return }

    async function loadInitialData() {
      setLoading(true)
      try {
        const [pokemonRes] = await Promise.all([
          fetch('/api/shiny?limit=150'),
        ])
        const pokemonData = await pokemonRes.json()
        setPokemon(pokemonData.data || [])

        if (user?.id) await fetchUserShinies(user.id)
      } catch (err) {
        console.error('[shop] Error cargando datos iniciales:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [isLoaded, isSignedIn])

  // ─── Effect #2: manejar retorno de Stripe (separado para que se ejecute
  //               incluso si isLoaded/isSignedIn ya eran true antes del redirect) ─
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return

    const isSuccess  = searchParams.get('success') === 'true'
    const isCanceled = searchParams.get('canceled') === 'true'
    const idsParam   = searchParams.get('ids')
    const packId     = searchParams.get('packId')
    const ckParam    = searchParams.get('ck')

    // Cancelado
    if (isCanceled) {
      setShowCanceled(true)
      setTimeout(() => setShowCanceled(false), 4000)
      navigate('/shop', { replace: true })
      return
    }

    // Éxito — solo procesar una vez
    if (!isSuccess || !idsParam || hasHandledSuccess.current) return
    hasHandledSuccess.current = true

    const clerkIdToUse = ckParam || user.id

    async function handleStripeSuccess() {
      try {
        console.log('[shop] Confirmando compra:', { clerkIdToUse, idsParam, packId })

        const res = await fetch('/api/payments/confirm-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: clerkIdToUse,
            pokedexIds: idsParam,
            ...(packId ? { packId } : {}),
          }),
        })
        const result = await res.json()
        console.log('[shop] confirm-purchase resultado:', result)
      } catch (e) {
        console.error('[shop] confirm-purchase falló:', e)
      }

      // Recargar shinies actualizados desde la BD
      const latest = await fetchUserShinies(user!.id)

      // Preparar modal con los pokémones comprados
      const ids = idsParam!.split(',').map(Number).filter(Boolean)
      setPokemon((allPokemon) => {
        const bought = ids
          .map((id) => allPokemon.find((p) => p.pokedexId === id))
          .filter(Boolean) as Pokemon[]
        if (bought.length > 0) setPackResults(bought.slice(0, 5))
        return allPokemon
      })

      // Limpiar URL al final para no perder params antes de procesar
      setTimeout(() => navigate('/shop', { replace: true }), 200)
    }

    handleStripeSuccess()
  }, [isLoaded, isSignedIn, searchParams, user?.id])

  async function fetchUserShinies(userId: string) {
    try {
      const res  = await fetch(`/api/payments/user-shinies/${userId}`)
      const data = await res.json()
      setOwnedShinies(data.unlockedShinies || [])
      setPurchasedPacks(data.purchasedPacks || [])
      return (data.unlockedShinies || []) as number[]
    } catch (e) {
      console.error('[shop] Error cargando shinies del usuario:', e)
      return [] as number[]
    }
  }

  async function handleBuy(pokedexId: number) {
    if (!user) return
    setBuyingId(pokedexId)
    setBuyError(null)
    try {
      console.log('[shop] Comprando pokémon individual:', pokedexId)
      const res  = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id, pokedexId }),
      })
      const data = await res.json()
      console.log('[shop] create-checkout respuesta:', data)

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        const msg = data.error || 'No se pudo crear la sesión de pago'
        console.error('[shop] Error en checkout:', msg)
        setBuyError(msg)
        setTimeout(() => setBuyError(null), 5000)
      }
    } catch (err) {
      console.error('[shop] Error de red en handleBuy:', err)
      setBuyError('Error de conexión. Intenta de nuevo.')
      setTimeout(() => setBuyError(null), 5000)
    } finally {
      setBuyingId(null)
    }
  }

  async function handleBuyPack(packId: string) {
    if (!user) return
    setBuyingId(packId)
    setBuyError(null)
    try {
      console.log('[shop] Comprando pack:', packId)
      const res  = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id, packId }),
      })
      const data = await res.json()
      console.log('[shop] create-checkout pack respuesta:', data)

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        const msg = data.error || 'No se pudo crear la sesión de pago'
        setBuyError(msg)
        setTimeout(() => setBuyError(null), 5000)
      }
    } catch (err) {
      console.error('[shop] Error de red en handleBuyPack:', err)
      setBuyError('Error de conexión. Intenta de nuevo.')
      setTimeout(() => setBuyError(null), 5000)
    } finally {
      setBuyingId(null)
    }
  }

  function handleCloseModal() {
    setPackResults(null)
    if (user?.id) fetchUserShinies(user.id)
  }

  const filteredPokemon = rarityFilter === 'all'
    ? pokemon
    : pokemon.filter((p) => p.rarity === rarityFilter)

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a14' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'gold' }}>
          CARGANDO TIENDA...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <PixelBg blur={true} />

      {packResults && packResults.length > 0 && (
        <PackOpeningModal results={packResults} onClose={handleCloseModal} />
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)',
                background: 'none', border: '1px solid var(--border)', borderRadius: '4px',
                padding: '0.5rem 0.75rem', cursor: 'pointer', letterSpacing: '0.06em',
              }}
            >← VOLVER</button>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(12px, 2vw, 18px)',
              color: 'var(--accent)', marginBottom: '0', textShadow: '0 0 20px rgba(255,215,0,0.4)',
            }}>TIENDA SHINY</h1>
          </div>

          {/* Filtros rarity */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {RARITY_ORDER.map((r) => (
              <button key={r} onClick={() => setRarityFilter(r)} style={{
                fontFamily: 'var(--font-display)', fontSize: '7px', padding: '0.4rem 0.8rem',
                background: rarityFilter === r ? 'var(--accent)' : 'transparent',
                color: rarityFilter === r ? '#0a0a0f' : 'var(--text-muted)',
                border: `1px solid ${rarityFilter === r ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{r}</button>
            ))}
            <button onClick={() => setRarityFilter('all')} style={{
              fontFamily: 'var(--font-display)', fontSize: '7px', padding: '0.4rem 0.8rem',
              background: rarityFilter === 'all' ? 'var(--accent)' : 'transparent',
              color: rarityFilter === 'all' ? '#0a0a0f' : 'var(--text-muted)',
              border: `1px solid ${rarityFilter === 'all' ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em',
            }}>TODOS</button>
          </div>
        </div>

        {/* Error banner */}
        {buyError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px',
            padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <p style={{ color: '#ef4444', fontSize: '12px', fontFamily: 'var(--font-display)' }}>{buyError}</p>
          </div>
        )}

        {/* Cancelado */}
        {showCanceled && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px',
            padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Compra cancelada. Puedes intentar de nuevo cuando quieras.</p>
          </div>
        )}

        {/* Packs */}
        <div style={{ background: 'rgba(16,16,26,0.8)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--accent)', marginBottom: '1rem', letterSpacing: '0.1em' }}>PACKS ESPECIALES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {PACKS.map((pack) => (
              <div key={pack.id} style={{
                background: 'rgba(20,20,31,0.9)',
                border: `1px solid ${purchasedPacks.includes(pack.id) ? '#22c55e' : 'var(--border)'}`,
                borderRadius: '8px', padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                boxShadow: purchasedPacks.includes(pack.id) ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '32px' }}>{pack.icon}</span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--accent)', marginBottom: '0.3rem' }}>{pack.name}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pack.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={buyingId === pack.id}
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: '8px', padding: '0.75rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#0a0a0f', border: 'none', borderRadius: '4px',
                    cursor: buyingId === pack.id ? 'not-allowed' : 'pointer',
                    opacity: buyingId === pack.id ? 0.6 : 1, letterSpacing: '0.08em',
                  }}
                >
                  {buyingId === pack.id ? 'CARGANDO...' : `$${(pack.price / 100).toFixed(2)} USD`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Grid de pokemon */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--accent)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            POKEMON SHINY ({ownedShinies.length} / {pokemon.length})
          </h2>
          {filteredPokemon.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '9px' }}>
              NO HAY SHINIES EN ESTA CATEGORIA
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
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
