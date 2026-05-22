import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const API = '/api'

export default function Home() {
  const { user, isSignedIn } = useUser()
  const [tab, setTab]         = useState<'create' | 'join'>('create')
  const [name, setName]       = useState('')
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleCreate() {
    if (!name.trim()) return setError('Ingresa tu nombre')
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      window.location.href = `/lobby/${data.code}?player=${encodeURIComponent(name.trim())}`
    } catch { setError('Error de red') }
    finally  { setLoading(false) }
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Ingresa tu nombre')
    if (!code.trim()) return setError('Ingresa el codigo de sala')
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/rooms/${code.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      window.location.href = `/lobby/${code.trim().toUpperCase()}?player=${encodeURIComponent(name.trim())}`
    } catch { setError('Error de red') }
    finally  { setLoading(false) }
  }

  return (
    <div className="page anim-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="anim-glow" style={{ fontSize: 'clamp(12px, 2vw, 18px)', marginBottom: '0.5rem' }}>
          POKEMON BATTLE ROOMS
        </h1>
        <p style={{ fontSize: '11px' }}>Selecciona tu equipo. Elige tus movimientos. Gana la batalla.</p>
      </div>

      {!isSignedIn && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/login" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '9px',
            color: 'var(--accent)',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '1px solid var(--accent)',
            borderRadius: '4px',
            display: 'inline-block',
          }}>
            INICIAR SESION / REGISTRARSE
          </Link>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1,
                padding: '0.6rem',
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: '8px',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              {t === 'create' ? 'CREAR SALA' : 'UNIRSE'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            TU NOMBRE
          </label>
          <input
            type="text"
            placeholder="Ash Ketchum"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
            maxLength={20}
          />
        </div>

        {tab === 'join' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              CODIGO DE SALA
            </label>
            <input
              type="text"
              placeholder="ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '16px', textAlign: 'center' }}
            />
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--red)', fontSize: '11px', marginBottom: '1rem' }}>
            ERROR: {error}
          </p>
        )}

        <button
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={tab === 'create' ? handleCreate : handleJoin}
          disabled={loading}
        >
          {loading ? 'CARGANDO...' : tab === 'create' ? 'CREAR SALA' : 'UNIRSE A SALA'}
        </button>

        {isSignedIn && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/shop" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '8px',
              color: '#f59e0b',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              ⭐ TIENDA SHINY
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
