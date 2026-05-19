import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const API = '/api'

export default function Lobby() {
  const { code }            = useParams<{ code: string }>()
  const [searchParams]      = useSearchParams()
  const playerName          = searchParams.get('player') ?? ''
  const roomCode            = code?.toUpperCase() ?? ''

  const [players, setPlayers] = useState<{ name: string }[]>([])
  const [dots, setDots]       = useState('.')

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch(`${API}/rooms/${roomCode}`)
        const data = await res.json()
        setPlayers(data.players ?? [])
        if (data.status === 'selecting' || data.status === 'battle') {
          window.location.href = `/select/${roomCode}?player=${encodeURIComponent(playerName)}`
        }
      } catch { /* silent */ }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [roomCode, playerName])

  return (
    <div className="page anim-fade-in">
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          CODIGO DE SALA
        </p>

        <h1 className="anim-glow" style={{ fontSize: 'clamp(28px, 6vw, 48px)', letterSpacing: '0.3em', marginBottom: '2rem', fontFamily: 'var(--font-display)' }}>
          {roomCode}
        </h1>

        <hr className="divider" />

        <div style={{ marginBottom: '1.5rem' }}>
          {players.map((p, i) => (
            <div key={i} className="anim-slide-in"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', animationDelay: `${i * 0.1}s` }}
            >
              <span style={{ color: 'var(--green)', fontFamily: 'var(--font-display)', fontSize: '9px' }}>ON</span>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text)' }}>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text-muted)' }}>LISTO</span>
            </div>
          ))}

          {players.length < 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '9px' }}>--</span>
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Esperando oponente{dots}</span>
            </div>
          )}
        </div>

        <p style={{ fontSize: '11px' }}>Comparte el codigo con tu oponente para comenzar.</p>
      </div>
    </div>
  )
}
