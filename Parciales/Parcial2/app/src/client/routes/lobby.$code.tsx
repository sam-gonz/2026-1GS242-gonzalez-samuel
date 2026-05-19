import { useEffect, useState } from 'react'

const API = '/api'

function getQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? ''
}

export default function Lobby() {
  const code       = window.location.pathname.split('/').pop()?.toUpperCase() ?? ''
  const playerName = getQueryParam('player')

  const [status, setStatus]   = useState<string>('waiting')
  const [players, setPlayers] = useState<{ name: string; ready: boolean }[]>([])
  const [dots, setDots]       = useState('.')

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch(`${API}/rooms/${code}`)
        const data = await res.json()
        setStatus(data.status)
        setPlayers(data.players ?? [])
        if (data.status === 'selecting' || data.status === 'battle') {
          window.location.href = `/select/${code}?player=${encodeURIComponent(playerName)}`
        }
      } catch { /* silent */ }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [code, playerName])

  return (
    <div className="page anim-fade-in">
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          CODIGO DE SALA
        </p>

        <h1
          className="anim-glow"
          style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            letterSpacing: '0.3em',
            marginBottom: '2rem',
            fontFamily: 'var(--font-display)',
          }}
        >
          {code}
        </h1>

        <hr className="divider" />

        <div style={{ marginBottom: '1.5rem' }}>
          {players.map((p, i) => (
            <div
              key={i}
              className="anim-slide-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span style={{ color: 'var(--green)', fontSize: '10px', fontFamily: 'var(--font-display)' }}>ON</span>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text)' }}>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text-muted)' }}>
                LISTO
              </span>
            </div>
          ))}

          {players.length < 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '10px' }}>--</span>
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Esperando oponente{dots}</span>
            </div>
          )}
        </div>

        <p style={{ fontSize: '11px' }}>
          Comparte el codigo con tu oponente para comenzar.
        </p>
      </div>
    </div>
  )
}
