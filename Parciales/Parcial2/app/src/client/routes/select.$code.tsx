import { useEffect, useState } from 'react'

const API = '/api'

function getQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? ''
}

const TYPES = [
  'normal','fire','water','grass','electric','ice','fighting',
  'poison','ground','flying','psychic','bug','rock','ghost',
  'dragon','dark','steel','fairy',
]

interface Pokemon {
  pokedexId: number
  name: string
  types: string[]
  spriteUrl: string
  baseStats: {
    hp: number
    attack: number
    defense: number
    speed: number
  }
  moveIds: string[]
}

export default function TeamSelect() {
  const code       = window.location.pathname.split('/').pop()?.toUpperCase() ?? ''
  const playerName = getQueryParam('player')

  const [pokemon, setPokemon]   = useState<Pokemon[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [submitting, setSubmit] = useState(false)
  const [error, setError]       = useState('')
  const LIMIT = 24

  useEffect(() => { loadPokemon() }, [page, search, typeFilter])

  async function loadPokemon() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search     ? { name: search }     : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      })
      const res  = await fetch(`${API}/pokemon?${params}`)
      const data = await res.json()
      setPokemon(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch { setError('No se pudo cargar el catalogo') }
    finally  { setLoading(false) }
  }

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 6 ? [...prev, id] : prev
    )
  }

  async function handleSubmit() {
    if (selected.length < 1) return setError('Selecciona al menos 1 Pokemon')
    setSubmit(true); setError('')
    try {
      const res = await fetch(`${API}/rooms/${code}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, team: selected }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      window.location.href = `/battle/${code}?player=${encodeURIComponent(playerName)}`
    } catch { setError('Error de red') }
    finally  { setSubmit(false) }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>ELIGE TU EQUIPO</h2>
          <p style={{ fontSize: '11px' }}>Sala: <strong style={{ color: 'var(--accent)' }}>{code}</strong> &mdash; {selected.length}/6 Pokemon</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={selected.length === 0 || submitting}
        >
          {submitting ? 'CARGANDO...' : `CONFIRMAR EQUIPO (${selected.length})`}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: '1', minWidth: '180px', maxWidth: '300px' }}
        />
        <select
          value={typeFilter}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            padding: '0.75rem 1rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Todos los tipos</option>
          {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {error && <p style={{ color: 'var(--red)', marginBottom: '1rem', fontSize: '12px' }}>ERROR: {error}</p>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>Cargando...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {pokemon.map((p) => {
            const isSelected = selected.includes(p.pokedexId)
            const isFull     = selected.length >= 6 && !isSelected
            return (
              <button
                key={p.pokedexId}
                onClick={() => !isFull && toggleSelect(p.pokedexId)}
                style={{
                  background:   isSelected ? 'rgba(255,215,0,0.08)' : 'var(--bg-card)',
                  border:       isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding:      '0.75rem 0.5rem',
                  cursor:       isFull ? 'not-allowed' : 'pointer',
                  opacity:      isFull ? 0.4 : 1,
                  transition:   'border-color 0.15s, background 0.15s, transform 0.1s',
                  display:      'flex',
                  flexDirection: 'column',
                  alignItems:   'center',
                  gap:          '0.4rem',
                  position:     'relative',
                }}
              >
                {isSelected && (
                  <span style={{
                    position: 'absolute', top: 4, right: 6,
                    fontFamily: 'var(--font-display)', fontSize: '7px',
                    color: 'var(--accent)',
                  }}>
                    #{selected.indexOf(p.pokedexId) + 1}
                  </span>
                )}
                <img src={p.spriteUrl} alt={p.name} style={{ width: 64, height: 64, imageRendering: 'pixelated' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text)', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.4 }}>
                  {p.name}
                </span>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {p.types.map((t) => (
                    <span key={t} className={`type-badge type-${t}`}>{t}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button className="btn btn--ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          PREV
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)' }}>
          {page} / {totalPages}
        </span>
        <button className="btn btn--ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          NEXT
        </button>
      </div>

      {selected.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text-muted)', marginRight: '0.5rem' }}>EQUIPO:</span>
          {selected.map((id) => {
            const p = pokemon.find((x) => x.pokedexId === id)
            return p ? (
              <img key={id} src={p.spriteUrl} alt={p.name} title={p.name}
                style={{ width: 40, height: 40, imageRendering: 'pixelated', cursor: 'pointer' }}
                onClick={() => toggleSelect(id)}
              />
            ) : null
          })}
          <button className="btn btn--primary" style={{ marginLeft: 'auto' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'CARGANDO...' : 'IR A BATALLA'}
          </button>
        </div>
      )}
    </div>
  )
}
