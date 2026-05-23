import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import '../styles/battle.css'

const API = '/api'

function hpColorClass(current: number, max: number) {
  const pct = current / max
  if (pct > 0.5) return 'hp-bar--high'
  if (pct > 0.2) return 'hp-bar--mid'
  return 'hp-bar--low'
}

function logClass(msg: string) {
  if (msg.includes('super efectivo'))  return 'log-entry log-entry--super'
  if (msg.includes('No tiene efecto')) return 'log-entry log-entry--immune'
  if (msg.includes('critico'))         return 'log-entry log-entry--critical'
  if (msg.includes('debilit'))         return 'log-entry log-entry--faint'
  if (msg.includes('switch') || msg.includes('cambi')) return 'log-entry log-entry--switch'
  if (msg.includes('gano'))            return 'log-entry log-entry--win'
  return 'log-entry'
}

export default function BattleScreen() {
  const { code }        = useParams<{ code: string }>()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const playerName      = searchParams.get('player') ?? ''
  const roomCode        = code?.toUpperCase() ?? ''

  const [battle, setBattle]         = useState<any>(null)
  const [selectedAction, setAction] = useState<any>(null)
  const [mode, setMode]             = useState<'move' | 'switch'>('move')
  const [submitting, setSubmitting] = useState(false)
  const [spriteAnim, setSpriteAnim] = useState<Record<string, string>>({})
  const logRef = useRef<HTMLDivElement>(null)

  // FIX: si no hay playerName en la URL, redirigir al home
  useEffect(() => {
    if (!playerName) {
      navigate('/')
    }
  }, [playerName])

  useEffect(() => {
    fetchBattle()
    const id = setInterval(fetchBattle, 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battle?.battleLog])

  async function fetchBattle() {
    try {
      const res  = await fetch(`${API}/battle/${roomCode}`)
      const data = await res.json()
      setBattle(data)
    } catch { /* silent */ }
  }

  async function submitAction() {
    if (!selectedAction) return
    setSubmitting(true)
    try {
      const myId = getMyPlayer()?.activePokemonId
      if (myId) setSpriteAnim((p) => ({ ...p, [myId]: 'sprite-attack' }))
      setTimeout(() => setSpriteAnim({}), 400)

      const res = await fetch(`${API}/battle/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, action: selectedAction }),
      })
      const data = await res.json()
      if (data.log) {
        const opp = getOpponentPlayer()
        if (opp) setSpriteAnim((p) => ({ ...p, [opp.activePokemonId]: 'sprite-hit' }))
        setTimeout(() => setSpriteAnim({}), 500)
      }
      setAction(null)
      await fetchBattle()
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  // FIX: buscar por nombre exacto — nunca retornar undefined como "yo"
  function getMyPlayer()       { return battle?.players?.find((p: any) => p.name === playerName) }
  function getOpponentPlayer() { return battle?.players?.find((p: any) => p.name !== playerName) }
  function getActive(player: any) { return player?.team?.find((p: any) => p.pokedexId === player.activePokemonId) }

  // Pantalla de carga inicial
  if (!battle) {
    return (
      <div className="page">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '10px' }}>Cargando batalla...</p>
      </div>
    )
  }

  const myPlayer     = getMyPlayer()
  const oppPlayer    = getOpponentPlayer()
  const myActive     = getActive(myPlayer)
  const oppActive    = getActive(oppPlayer)
  const isEnded      = battle.status === 'ended'
  const didWin       = battle.winnerPlayerId === playerName
  const alreadyActed = myPlayer?.selectedAction !== null

  // FIX: si mi jugador no existe en la batalla, mostrar error claro
  if (!myPlayer) {
    return (
      <div className="page">
        <p style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: '10px' }}>
          ERROR: Jugador "{playerName}" no encontrado en esta batalla.
        </p>
        <button
          className="btn btn--ghost"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/')}
        >
          VOLVER AL INICIO
        </button>
      </div>
    )
  }

  // FIX: si el oponente aun no ha elegido equipo, mostrar pantalla de espera
  if (!oppPlayer) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '10px', marginBottom: '0.75rem' }}>
            ESPERANDO OPONENTE...
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            El jugador 2 aun no ha elegido su equipo. Espera un momento.
          </p>
        </div>
      </div>
    )
  }

  if (isEnded) {
    return (
      <div className="victory-screen anim-fade-in">
        {didWin ? (
          <><h1 className="victory-title">VICTORIA</h1><p>Derrotaste a {oppPlayer?.name}.</p></>
        ) : (
          <><h1 className="defeat-title">DERROTA</h1><p>{battle.winnerPlayerId} gano la batalla.</p></>
        )}
        <button className="btn btn--primary" onClick={() => window.location.href = '/'}>VOLVER AL INICIO</button>
      </div>
    )
  }

  return (
    <div className="battle-screen">
      <div className="battle-topbar">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)' }}>
          TURNO <span style={{ color: 'var(--accent)' }}>{battle.turn}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px' }}>
          {myPlayer?.name} <span style={{ color: 'var(--text-muted)' }}>vs</span> {oppPlayer?.name}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: alreadyActed ? 'var(--green)' : 'var(--text-muted)' }}>
          {alreadyActed ? 'LISTO' : 'ESPERANDO'}
        </span>
      </div>

      <div className="battle-arena">
        {[{ player: oppPlayer, active: oppActive, isOpp: true }, { player: myPlayer, active: myActive, isOpp: false }].map(({ player, active, isOpp }) => (
          <div key={player?.name} className={`pokemon-slot ${isOpp ? '' : 'pokemon-slot--active'} ${active?.currentHp <= 0 ? 'pokemon-slot--fainted' : ''}`}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: isOpp ? 'var(--text-muted)' : 'var(--accent)', alignSelf: 'flex-start' }}>
              {isOpp ? 'OPONENTE' : 'TU POKEMON'}
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {active?.types?.map((t: string) => <span key={t} className={`type-badge type-${t}`}>{t}</span>)}
            </div>
            <img src={active?.spriteUrl} alt={active?.name}
              className={`pokemon-sprite ${isOpp ? 'pokemon-sprite--opponent' : ''} ${spriteAnim[active?.pokedexId] ?? ''}`}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', textTransform: 'capitalize', color: 'var(--text)' }}>{active?.name}</span>
            {active?.status && (
              <span className={`status-badge status-${active.status.name}`}>{active.status.name.toUpperCase()} ({active.status.remainingTurns}T)</span>
            )}
            <div className="pokemon-hp-label">HP {active?.currentHp ?? 0} / {active?.maxHp ?? 0}</div>
            <div className="hp-bar-wrap" style={{ width: '100%' }}>
              <div className={`hp-bar ${hpColorClass(active?.currentHp ?? 0, active?.maxHp ?? 1)}`}
                style={{ width: `${Math.max(0, (active?.currentHp / active?.maxHp) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="battle-bottom">
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {(['move', 'switch'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setAction(null) }}
              style={{ fontFamily: 'var(--font-display)', fontSize: '7px', padding: '0.4rem 0.8rem', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#0a0a0f' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}
            >
              {m === 'move' ? 'MOVER' : 'CAMBIAR'}
            </button>
          ))}
          {selectedAction && (
            <button className="btn btn--primary" style={{ marginLeft: 'auto', fontSize: '7px', padding: '0.4rem 0.8rem' }}
              onClick={submitAction} disabled={submitting || alreadyActed}
            >
              {submitting ? 'ENVIANDO...' : alreadyActed ? 'ENVIADO' : 'CONFIRMAR'}
            </button>
          )}
        </div>

        {mode === 'move' && (
          <div className="moves-grid" style={{ gridColumn: '1 / -1' }}>
            {(myActive?.moveNames ?? []).map((moveName: string) => (
              <button key={moveName}
                className={`move-btn ${selectedAction?.moveId === moveName ? 'move-btn--selected' : ''}`}
                onClick={() => setAction({ type: 'move', moveId: moveName })}
                disabled={alreadyActed || myActive?.currentHp <= 0}
              >
                {moveName.replace(/-/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {mode === 'switch' && (
          <div className="switch-panel" style={{ gridColumn: '1 / -1' }}>
            {(myPlayer?.team ?? []).map((p: any) => {
              const isActive  = p.pokedexId === myPlayer.activePokemonId
              const isFainted = p.currentHp <= 0
              return (
                <div key={p.pokedexId}
                  className={`switch-item ${isFainted ? 'switch-item--fainted' : ''} ${isActive ? 'switch-item--active' : ''}`}
                  onClick={() => { if (!isFainted && !isActive && !alreadyActed) setAction({ type: 'switch', pokemonId: p.pokedexId }) }}
                >
                  <img src={p.spriteUrl} alt={p.name} style={{ width: 36, height: 36, imageRendering: 'pixelated' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', textTransform: 'capitalize', color: isFainted ? 'var(--red)' : 'var(--text)' }}>{p.name}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>{p.currentHp}/{p.maxHp}</span>
                  {isActive  && <span style={{ fontFamily: 'var(--font-display)', fontSize: '6px', color: 'var(--accent)' }}>ACTIVO</span>}
                  {isFainted && <span style={{ fontFamily: 'var(--font-display)', fontSize: '6px', color: 'var(--red)' }}>KO</span>}
                </div>
              )
            })}
          </div>
        )}

        <div className="battle-log" ref={logRef} style={{ gridColumn: '1 / -1' }}>
          {(battle.battleLog ?? []).slice(-30).map((entry: any, i: number) => (
            <div key={i} className={logClass(entry.message)}>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>T{entry.turn}.</span>
              {entry.message}
            </div>
          ))}
          {battle.battleLog?.length === 0 && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>La batalla comienza. Elige tu accion.</p>
          )}
        </div>
      </div>
    </div>
  )
}
