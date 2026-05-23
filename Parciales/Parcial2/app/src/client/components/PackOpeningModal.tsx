import { useEffect, useRef, useState } from 'react'

interface ShinyResult {
  pokedexId: number
  name: string
  spriteUrl: string
  rarity: string
  types: string[]
}

interface Props {
  results: ShinyResult[]
  onClose: () => void
}

const RARITY_COLORS: Record<string, string> = {
  legendary: '#f59e0b',
  epic:      '#a855f7',
  rare:      '#3b82f6',
  uncommon:  '#22c55e',
  common:    '#94a3b8',
}

const RARITY_GLOW: Record<string, string> = {
  legendary: 'rgba(245,158,11,0.7)',
  epic:      'rgba(168,85,247,0.7)',
  rare:      'rgba(59,130,246,0.6)',
  uncommon:  'rgba(34,197,94,0.5)',
  common:    'rgba(148,163,184,0.25)',
}

// ─── Genera un carril de roulette para 1 pokemon ──────────────────────────────
function buildLane(target: ShinyResult, allResults: ShinyResult[], size = 42): ShinyResult[] {
  const pool = [...allResults]
  const filler: ShinyResult[] = []
  for (let i = 0; i < size; i++) filler.push(pool[i % pool.length])
  // El item final (en indice `size`) es el pokemon real
  return [...filler, target]
}

const CARD_W   = 130
const CARD_GAP = 12
const STEP     = CARD_W + CARD_GAP
const FINAL_IDX = 42   // posición del item real al final del carril

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

// ─── Una sola roulette ───────────────────────────────────────────────────────
interface RouletteProps {
  target: ShinyResult
  allResults: ShinyResult[]
  onDone: () => void
  spinIndex: number   // qué número de spin es (0‑4)
}

function SingleRoulette({ target, allResults, onDone, spinIndex }: RouletteProps) {
  const [offset, setOffset]         = useState(0)
  const [activeIdx, setActiveIdx]   = useState(0)
  const [done, setDone]             = useState(false)
  const rafRef                      = useRef<number>(0)
  const startRef                    = useRef<number>(0)
  const lane                        = useRef(buildLane(target, allResults))
  const viewW                       = typeof window !== 'undefined' ? window.innerWidth : 1024
  const targetOffset = -(FINAL_IDX * STEP) + viewW / 2 - CARD_W / 2
  const duration = 3200 + spinIndex * 200  // cada spin dura un poco más

  useEffect(() => {
    startRef.current = performance.now()
    function step(now: number) {
      const t      = Math.min((now - startRef.current) / duration, 1)
      const eased  = easeOutQuint(t)
      const off    = eased * targetOffset
      setOffset(off)
      setActiveIdx(Math.round(Math.max(0, Math.min(-off / STEP, lane.current.length - 1))))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setOffset(targetOffset)
        setActiveIdx(FINAL_IDX)
        setDone(true)
        setTimeout(onDone, 700)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const color = RARITY_COLORS[target.rarity] || '#fff'
  const glow  = RARITY_GLOW[target.rarity]  || 'rgba(255,255,255,0.2)'

  return (
    <div style={{ position: 'relative', width: '100vw', height: 180, overflow: 'hidden' }}>
      {/* carril */}
      <div style={{
        display: 'flex', gap: CARD_GAP, position: 'absolute', top: 0, left: 0,
        transform: `translateX(${offset}px)`, willChange: 'transform',
      }}>
        {lane.current.map((item, i) => {
          const isActive = i === activeIdx
          const isFinal  = done && i === FINAL_IDX
          return (
            <div key={i} style={{
              width: CARD_W, height: 176, borderRadius: 8, flexShrink: 0,
              background: '#12121f',
              border: `2px solid ${
                isFinal ? color : isActive ? 'rgba(255,215,0,0.9)' : '#2a2a3e'
              }`,
              boxShadow: isFinal
                ? `0 0 32px ${glow}, 0 0 60px ${glow}`
                : isActive ? '0 0 18px rgba(255,215,0,0.5)' : 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'border-color 0.1s, box-shadow 0.1s',
            }}>
              <img
                src={item.spriteUrl} alt={item.name}
                style={{ width: 72, height: 72, imageRendering: 'pixelated',
                  filter: isFinal ? `drop-shadow(0 0 10px ${color})` : 'none',
                  transition: 'filter 0.3s',
                }}
              />
              <span style={{
                fontFamily: 'var(--font-display,monospace)', fontSize: 7,
                color: RARITY_COLORS[item.rarity] || '#aaa', textTransform: 'capitalize',
                letterSpacing: '0.08em',
              }}>{item.name}</span>
            </div>
          )
        })}
      </div>
      {/* indicador central */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%',
        transform: 'translateX(-50%)', width: CARD_W + 4,
        borderLeft: '2px solid gold', borderRight: '2px solid gold',
        pointerEvents: 'none',
        boxShadow: '0 0 24px rgba(255,215,0,0.35)',
      }} />
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
export default function PackOpeningModal({ results, onClose }: Props) {
  const [currentSpin, setCurrentSpin] = useState(0)  // 0‑4: qué pokémon estamos girando
  const [phase, setPhase]             = useState<'spinning' | 'reveal'>('spinning')
  const [revealed, setRevealed]       = useState<boolean[]>(Array(results.length).fill(false))

  function handleSpinDone() {
    const next = currentSpin + 1
    if (next < results.length) {
      setCurrentSpin(next)
    } else {
      // Todos los spins terminaron → fase de reveal
      setTimeout(() => setPhase('reveal'), 300)
    }
  }

  useEffect(() => {
    if (phase !== 'reveal') return
    results.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => { const n = [...prev]; n[i] = true; return n })
      }, i * 320)
    })
  }, [phase])

  return (
    <>
      <style>{`
        .pom-overlay {
          position:fixed; inset:0; z-index:1000;
          background:rgba(0,0,0,0.94);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          overflow:hidden;
        }
        .pom-title {
          font-family:var(--font-display,monospace);
          font-size:11px; letter-spacing:.18em; color:gold;
          text-shadow:0 0 20px rgba(255,215,0,.7);
          margin-bottom:1.5rem; text-transform:uppercase;
        }
        .pom-progress {
          font-family:var(--font-display,monospace);
          font-size:8px; color:rgba(255,215,0,.5);
          margin-bottom:.75rem; letter-spacing:.1em;
        }
        .pom-reveal-grid {
          display:flex; gap:14px; flex-wrap:wrap;
          justify-content:center; padding:1.5rem;
          max-width:780px;
        }
        .pom-reveal-card {
          width:130px; height:176px; border-radius:10px;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:8px;
          background:#12121f; border:2px solid transparent;
          transform:rotateY(180deg) scale(.85); opacity:0;
          transition:transform .5s cubic-bezier(.16,1,.3,1),
                      opacity .4s ease, box-shadow .4s ease;
        }
        .pom-reveal-card.on {
          transform:rotateY(0deg) scale(1); opacity:1;
        }
        .pom-close {
          margin-top:1.5rem;
          font-family:var(--font-display,monospace); font-size:10px;
          letter-spacing:.12em; padding:.75rem 2.5rem;
          background:transparent; border:1px solid rgba(255,255,255,.3);
          border-radius:6px; color:rgba(255,255,255,.7); cursor:pointer;
          transition:border-color .15s, color .15s;
        }
        .pom-close:hover { border-color:gold; color:gold; }
        .rarity-tag {
          font-family:var(--font-display,monospace);
          font-size:7px; letter-spacing:.1em; text-transform:uppercase;
        }
      `}</style>

      <div className="pom-overlay">
        {phase === 'spinning' && (
          <>
            <p className="pom-title">✨ Abriendo pack shiny...</p>
            <p className="pom-progress">
              POKEMON {currentSpin + 1} / {results.length}
            </p>
            {/* Solo renderiza el spin actual; key fuerza remount en cada cambio */}
            <SingleRoulette
              key={currentSpin}
              target={results[currentSpin]}
              allResults={results}
              onDone={handleSpinDone}
              spinIndex={currentSpin}
            />
          </>
        )}

        {phase === 'reveal' && (
          <>
            <p className="pom-title">🎉 ¡Tus nuevos shinies!</p>
            <div className="pom-reveal-grid">
              {results.map((item, i) => {
                const color = RARITY_COLORS[item.rarity] || '#fff'
                const glow  = RARITY_GLOW[item.rarity]  || 'rgba(255,255,255,.2)'
                return (
                  <div
                    key={item.pokedexId}
                    className={`pom-reveal-card${revealed[i] ? ' on' : ''}`}
                    style={{
                      borderColor: revealed[i] ? color : 'transparent',
                      boxShadow:   revealed[i]
                        ? `0 0 30px ${glow}, 0 0 0 1px ${color}44`
                        : 'none',
                    }}
                  >
                    <img
                      src={item.spriteUrl} alt={item.name}
                      style={{
                        width:80, height:80, imageRendering:'pixelated',
                        filter: revealed[i] ? `drop-shadow(0 0 10px ${color})` : 'none',
                        transition:'filter .4s ease',
                      }}
                    />
                    <span style={{
                      fontFamily:'var(--font-display,monospace)',
                      fontSize:8, color:'#fff', textTransform:'capitalize',
                    }}>{item.name}</span>
                    <span className="rarity-tag" style={{ color }}>
                      ✦ {item.rarity}
                    </span>
                  </div>
                )
              })}
            </div>
            <button className="pom-close" onClick={onClose}>CONTINUAR</button>
          </>
        )}
      </div>
    </>
  )
}
