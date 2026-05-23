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
  legendary: 'rgba(245,158,11,0.6)',
  epic:      'rgba(168,85,247,0.6)',
  rare:      'rgba(59,130,246,0.5)',
  uncommon:  'rgba(34,197,94,0.4)',
  common:    'rgba(148,163,184,0.2)',
}

export default function PackOpeningModal({ results, onClose }: Props) {
  const [phase, setPhase] = useState<'roulette' | 'reveal'>('roulette')
  const [rouletteOffset, setRouletteOffset] = useState(0)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealedCards, setRevealedCards] = useState<boolean[]>(Array(5).fill(false))
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const CARD_W = 140
  const CARD_GAP = 16
  const CARD_TOTAL = CARD_W + CARD_GAP

  // Generar lista larga para la ruleta (20 ciclos + los 5 reales al final)
  const rouletteItems = useRef<ShinyResult[]>(() => {
    const pool = [...results]
    const filler: ShinyResult[] = []
    // 40 cartas de relleno antes del resultado real
    for (let i = 0; i < 40; i++) {
      filler.push(pool[i % pool.length])
    }
    return [...filler, ...results]
  }())

  const FINAL_INDEX = 40 // donde comienzan los resultados reales
  const TARGET_OFFSET = -(FINAL_INDEX * CARD_TOTAL) + window.innerWidth / 2 - CARD_W / 2

  useEffect(() => {
    // Fase ruleta: animar con easing
    const duration = 4200
    startTimeRef.current = performance.now()

    function easeOutQuint(t: number) {
      return 1 - Math.pow(1 - t, 5)
    }

    function step(now: number) {
      const elapsed = now - startTimeRef.current
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutQuint(t)
      const offset = eased * TARGET_OFFSET
      setRouletteOffset(offset)

      // Calcular qué carta está centrada
      const centeredCard = Math.round(-offset / CARD_TOTAL)
      setCurrentIdx(Math.max(0, Math.min(centeredCard, rouletteItems.current.length - 1)))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setRouletteOffset(TARGET_OFFSET)
        setTimeout(() => setPhase('reveal'), 400)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    if (phase !== 'reveal') return
    // Revelar cartas una por una
    results.forEach((_, i) => {
      setTimeout(() => {
        setRevealedCards(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * 350)
    })
  }, [phase])

  return (
    <>
      <style>{`
        .pack-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pack-roulette-wrap {
          position: relative;
          width: 100vw;
          height: 200px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .pack-roulette-track {
          display: flex;
          gap: 16px;
          position: absolute;
          top: 0;
          left: 0;
          will-change: transform;
          transition: none;
        }
        .pack-roulette-card {
          width: 140px;
          height: 200px;
          border-radius: 8px;
          border: 2px solid var(--border, #333);
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          transition: border-color 0.15s;
        }
        .pack-roulette-card.active {
          border-color: gold;
          box-shadow: 0 0 24px rgba(255,215,0,0.5);
        }
        .pack-roulette-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 144px;
          border-left: 2px solid gold;
          border-right: 2px solid gold;
          pointer-events: none;
          box-shadow: 0 0 20px rgba(255,215,0,0.3);
        }
        .pack-reveal-grid {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          padding: 2rem;
          max-width: 820px;
        }
        .pack-reveal-card {
          width: 140px;
          height: 200px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #1a1a2e;
          border: 2px solid transparent;
          transform: rotateY(180deg) scale(0.8);
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.4s ease,
                      box-shadow 0.4s ease;
          cursor: default;
        }
        .pack-reveal-card.revealed {
          transform: rotateY(0deg) scale(1);
          opacity: 1;
        }
        .pack-close-btn {
          margin-top: 1.5rem;
          font-family: var(--font-display, monospace);
          font-size: 10px;
          letter-spacing: 0.1em;
          padding: 0.75rem 2rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .pack-close-btn:hover {
          border-color: gold;
          color: gold;
        }
        .pack-title {
          font-family: var(--font-display, monospace);
          font-size: 11px;
          letter-spacing: 0.15em;
          color: gold;
          text-shadow: 0 0 20px rgba(255,215,0,0.6);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .rarity-label {
          font-family: var(--font-display, monospace);
          font-size: 7px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="pack-modal-overlay">
        {phase === 'roulette' && (
          <>
            <p className="pack-title">✨ Abriendo pack shiny...</p>
            <div className="pack-roulette-wrap">
              <div
                className="pack-roulette-track"
                style={{ transform: `translateX(${rouletteOffset}px)` }}
              >
                {rouletteItems.current.map((item, i) => (
                  <div
                    key={i}
                    className={`pack-roulette-card${i === currentIdx ? ' active' : ''}`}
                  >
                    <img
                      src={item.spriteUrl}
                      alt={item.name}
                      style={{ width: 72, height: 72, imageRendering: 'pixelated' }}
                    />
                    <span style={{
                      fontFamily: 'var(--font-display, monospace)',
                      fontSize: '7px',
                      color: RARITY_COLORS[item.rarity] || '#fff',
                      textTransform: 'capitalize',
                    }}>
                      {item.name}
                    </span>
                    <span
                      className="rarity-label"
                      style={{ color: RARITY_COLORS[item.rarity] || '#fff' }}
                    >
                      {item.rarity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pack-roulette-indicator" />
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <p className="pack-title">🎉 ¡Tus nuevos shinies!</p>
            <div className="pack-reveal-grid">
              {results.map((item, i) => (
                <div
                  key={item.pokedexId}
                  className={`pack-reveal-card${revealedCards[i] ? ' revealed' : ''}`}
                  style={{
                    borderColor: revealedCards[i] ? RARITY_COLORS[item.rarity] : 'transparent',
                    boxShadow: revealedCards[i]
                      ? `0 0 28px ${RARITY_GLOW[item.rarity]}, 0 0 0 1px ${RARITY_COLORS[item.rarity]}44`
                      : 'none',
                  }}
                >
                  <img
                    src={item.spriteUrl}
                    alt={item.name}
                    style={{
                      width: 80, height: 80, imageRendering: 'pixelated',
                      filter: revealedCards[i] ? `drop-shadow(0 0 8px ${RARITY_COLORS[item.rarity]})` : 'none',
                      transition: 'filter 0.4s ease',
                    }}
                  />
                  <span style={{
                    fontFamily: 'var(--font-display, monospace)',
                    fontSize: '8px',
                    color: '#fff',
                    textTransform: 'capitalize',
                  }}>
                    {item.name}
                  </span>
                  <span
                    className="rarity-label"
                    style={{ color: RARITY_COLORS[item.rarity] || '#fff' }}
                  >
                    ✦ {item.rarity}
                  </span>
                </div>
              ))}
            </div>
            <button className="pack-close-btn" onClick={onClose}>
              CONTINUAR
            </button>
          </>
        )}
      </div>
    </>
  )
}
