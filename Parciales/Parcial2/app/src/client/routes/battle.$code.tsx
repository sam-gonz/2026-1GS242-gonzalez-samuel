import { useEffect, useRef, useState } from 'react'
import '../styles/battle.css'

const API = '/api'

function getQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? ''
}

function hpColor(current: number, max: number) {
  const pct = current / max
  if (pct > 0.5) return 'hp-bar--high'
  if (pct > 0.2) return 'hp-bar--mid'
  return 'hp-bar--low'
}

function logClass(msg: string) {
  if (msg.includes('super efectivo'))  return 'log-entry log-entry--super'
  if (msg.includes('No tiene efecto')) return 'log-entry log-entry--immune'
  if (msg.includes('crítico'))         return 'log-entry log-entry--critical'
  if (msg.includes('debilit'))         return 'log-entry log-entry--faint'
  if (msg.includes('switch') || msg.includes('cambi')) return 'log-entry log-entry--switch'
  if (msg.includes('ganó'))            return 'log-entry log-entry--win'
  return 'log-entry'
}

export default function BattleScreen() {
  const code       = window.location.pathname.split('/').pop()?.toUpperCase() ?? ''
  const playerName = getQueryParam('player')

  const [battle, setBattle]           = useState<any>(null)
  const [selectedAction, setAction]   = useState<any>(null)
  const [mode, setMode]               = useState<'move' | 'switch'>('move')
  const [submitting, setSubmitting]   = useState(false)
  const [spriteAnim, setSpriteAnim]   = useState<Record<string, string>>({})
  const logRef = useRef<HTMLDivElement>(null)

  // Polling cada 2s
  useEffect(() => {
    fetchBattle()
    const id = setInterval(fetchBattle, 2000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll del log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battle?.battleLog])

  async function fetchBattle() {
    try {
      const res  = await fetch(`${API}/battle/${code}`)
      const data = await res.json()
      setBattle(data)
    } catch { /* silent */ }
  }

  async function submitAction() {
    if (!selectedAction) return
    setSubmitting(true)
    try {
      // Animación de ataque en sprite propio
      const myPokemon = getMyPlayer()?.activePokemonId
      if (myPokemon) setSpriteAnim((p) => ({ ...p, [myPokemon]: 'sprite-attack' }))
      setTimeout(() => setSpriteAnim({}), 400)

      const res = await fetch(`${API}/battle/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, action: selectedAction }),
      })
      const data = await res.json()
      if (data.log) {
        // Animar sprite oponente si recibió daño
        const opp = getOpponentPlayer()
        if (opp) setSpriteAnim((p) => ({ ...p, [opp.activePokemonId]: 'sprite-hit' }))
        setTimeout(() => setSpriteAnim({}), 500)
      }
      setAction(null)
      await fetchBattle()
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  function getMyPlayer() {
    return battle?.players?.find((p: any) => p.name === playerName)
  }
  function getOpponentPlayer() {
    return battle?.players?.find((p: any) => p.name !== playerName)
  }
  function getActivePokemon(player: any) {
    return player?.team?.find((p: any) => p.pokedexId === player.activePokemonId)
  }

  // --- ESTADOS DE CARGA ---
  if (!battle) {
    return (
      <div className="page">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '10px' }}>Cargando batalla...</p>
      </div>
    )
  }

  const myPlayer  = getMyPlayer()
  const oppPlayer = getOpponentPlayer()
  const myActive  = getActivePokemon(myPlayer)
  const oppActive = getActivePokemon(oppPlayer)
  const isEnded   = battle.status === 'ended'
  const didWin    = battle.winnerPlayerId === playerName
  const alreadyActed = myPlayer?.selectedAction !== null

  // --- PANTALLA DE VICTORIA/DERROTA ---
  if (isEnded) {
    return (
      <div className="victory-screen anim-fade-in">
        {didWin ? (
          <>
            <h1 className="victory-title">🏆 ¡VICTORIA!</h1>
            <p>Derrotaste a {oppPlayer?.name}. ¡Eres el mejor entrenador!</p>
          </>
        ) : (
          <>
            <h1 className="defeat-title">💀 DERROTA</h1>
            <p>{battle.winnerPlayerId} ganó la batalla.</p>
          </>
        )}
        <button className="btn btn--primary" onClick={() => window.location.href = '/'}>
          ↩ VOLVER AL INICIO
        </button>
      </div>
    )
  }

  // --- PANTALLA DE BATALLA ---
  return (
    <div className="battle-screen">
      {/* Top bar */}
      <div className="battle-topbar">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'var(--text-muted)' }}>
          TURNO <span style={{ color: 'var(--accent)' }}>{battle.turn}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px' }}>
          {myPlayer?.name} <span style={{ color: 'var(--text-muted)' }}>vs</span> {oppPlayer?.name}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: alreadyActed ? 'var(--green)' : 'var(--text-muted)' }}>
          {alreadyActed ? '✅ LISTO' : 'ESPERANDO...'}
        </span>
      </div>

      {/* Arena */}
      <div className="battle-arena">
        {/* Oponente */}
        <div className={`pokemon-slot ${oppActive?.currentHp <= 0 ? 'pokemon-slot--fainted' : ''}` }>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text-muted)', alignSelf: 'flex-start' }}>OPONENTE</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {oppActive?.types?.map((t: string) => <span key={t} className={`type-badge type-${t}`}>{t}</span>)}
          </div>
          <img
            src={oppActive?.spriteUrl}
            alt={oppActive?.name}
            className={`pokemon-sprite pokemon-sprite--opponent ${spriteAnim[oppActive?.pokedexId] ?? ''}`}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', textTransform: 'capitalize', color: 'var(--text)' }}>
            {oppActive?.name}
          </span>
          {oppActive?.status && (
            <span className={`status-badge status-${oppActive.status.name}`}>
              {oppActive.status.name.toUpperCase()} ({oppActive.status.remainingTurns})
            </span>
          )}
          <div className="pokemon-hp-label">
            HP {oppActive?.currentHp ?? 0} / {oppActive?.maxHp ?? 0}
          </div>
          <div className="hp-bar-wrap" style={{ width: '100%' }}>
            <div
              className={`hp-bar ${hpColor(oppActive?.currentHp ?? 0, oppActive?.maxHp ?? 1)}`}
              style={{ width: `${Math.max(0, (oppActive?.currentHp / oppActive?.maxHp) * 100)}%` }}
            />
          </div>
        </div>

        {/* Mi Pokémon */}
        <div className={`pokemon-slot pokemon-slot--active ${myActive?.currentHp <= 0 ? 'pokemon-slot--fainted' : ''}`}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--accent)', alignSelf: 'flex-start' }}>TU POKÉMON</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {myActive?.types?.map((t: string) => <span key={t} className={`type-badge type-${t}`}>{t}</span>)}
          </div>
          <img
            src={myActive?.spriteUrl}
            alt={myActive?.name}
            className={`pokemon-sprite ${spriteAnim[myActive?.pokedexId] ?? ''}`}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '8px', textTransform: 'capitalize', color: 'var(--text)' }}>
            {myActive?.name}
          </span>
          {myActive?.status && (
            <span className={`status-badge status-${myActive.status.name}`}>
              {myActive.status.name.toUpperCase()} ({myActive.status.remainingTurns})
            </span>
          )}
          <div className="pokemon-hp-label">
            HP {myActive?.currentHp ?? 0} / {myActive?.maxHp ?? 0}
          </div>
          <div className="hp-bar-wrap" style={{ width: '100%' }}>
            <div
              className={`hp-bar ${hpColor(myActive?.currentHp ?? 0, myActive?.maxHp ?? 1)}`}
              style={{ width: `${Math.max(0, (myActive?.currentHp / myActive?.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="battle-bottom">
        {/* Tabs move/switch */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {(['move', 'switch'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setAction(null) }}
              style={{
                fontFamily: 'var(--font-display)', fontSize: '7px',
                padding: '0.4rem 0.8rem',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#0a0a0f' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
              }}
            >
              {m === 'move' ? '⚔ MOVER' : '⇄ CAMBIAR'}
            </button>
          ))}
          {selectedAction && (
            <button
              className="btn btn--primary"
              style={{ marginLeft: 'auto', fontSize: '7px', padding: '0.4rem 0.8rem' }}
              onClick={submitAction}
              disabled={submitting || alreadyActed}
            >
              {submitting ? '...' : alreadyActed ? '✅ ENVIADO' : '▶ CONFIRMAR'}
            </button>
          )}
        </div>

        {/* Movimientos */}
        {mode === 'move' && (
          <div className="moves-grid" style={{ gridColumn: '1 / -1' }}>
            {(myActive?.moveNames ?? []).map((moveName: string) => {
              const isSelected = selectedAction?.moveId === moveName
              return (
                <button
                  key={moveName}
                  className={`move-btn ${isSelected ? 'move-btn--selected' : ''}`}
                  onClick={() => setAction({ type: 'move', moveId: moveName })}
                  disabled={alreadyActed || myActive?.currentHp <= 0}
                >
                  {moveName.replace(/-/g, ' ').toUpperCase()}
                </button>
              )
            })}
          </div>
        )}

        {/* Switch */}
        {mode === 'switch' && (
          <div className="switch-panel" style={{ gridColumn: '1 / -1' }}>
            {(myPlayer?.team ?? []).map((p: any) => {
              const isActive  = p.pokedexId === myPlayer.activePokemonId
              const isFainted = p.currentHp <= 0
              return (
                <div
                  key={p.pokedexId}
                  className={`switch-item ${isFainted ? 'switch-item--fainted' : ''} ${isActive ? 'switch-item--active' : ''}`}
                  onClick={() => {
                    if (!isFainted && !isActive && !alreadyActed)
                      setAction({ type: 'switch', pokemonId: p.pokedexId })
                  }}
                >
                  <img src={p.spriteUrl} alt={p.name} style={{ width: 36, height: 36, imageRendering: 'pixelated' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '7px', textTransform: 'capitalize', color: isFainted ? 'var(--red)' : 'var(--text)' }}>
                    {p.name}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '11px', color: hpColor(p.currentHp, p.maxHp) === 'hp-bar--low' ? 'var(--red)' : 'var(--text-muted)' }}>
                    {p.currentHp}/{p.maxHp}
                  </span>
                  {isActive && <span style={{ fontFamily: 'var(--font-display)', fontSize: '6px', color: 'var(--accent)' }}>ACTIVO</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Log de batalla */}
        <div className="battle-log" ref={logRef} style={{ gridColumn: '1 / -1' }}>
          {(battle.battleLog ?? []).slice(-30).map((entry: any, i: number) => (
            <div key={i} className={logClass(entry.message)}>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>T{entry.turn}.</span>
              {entry.message}
            </div>
          ))}
          {battle.battleLog?.length === 0 && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>La batalla comienza. ¡Elige tu acción!</p>
          )}
        </div>
      </div>
    </div>
  )
}
