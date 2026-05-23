import { useState } from 'react'

interface ShinyCardProps {
  pokedexId: number
  name: string
  types: string[]
  rarity: string
  price: number
  spriteUrl: string
  isOwned: boolean
  onBuy: (pokedexId: number) => void
  loading?: boolean
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export default function ShinyCard({
  pokedexId,   // ← FIX: faltaba desestructurar pokedexId
  name,
  types,
  rarity,
  price,
  spriteUrl,
  isOwned,
  onBuy,
  loading,
}: ShinyCardProps) {
  const [imgError, setImgError] = useState(false)
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common

  return (
    <div style={{
      background: 'rgba(16,16,26,0.9)',
      border: `1px solid ${isOwned ? '#22c55e' : 'var(--border)'}`,
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      boxShadow: isOwned
        ? '0 0 20px rgba(34,197,94,0.2)'
        : `0 0 20px ${rarityColor}22`,
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        position: 'relative',
        animation: isOwned ? 'none' : 'float 3s ease-in-out infinite',
      }}>
        {!imgError ? (
          <img
            src={spriteUrl}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isOwned ? 'none' : 'drop-shadow(0 0 12px rgba(255,215,0,0.6))',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-panel)',
            borderRadius: '50%',
            color: 'var(--text-muted)',
            fontSize: '10px',
          }}>
            {name[0]}
          </div>
        )}
        {isOwned && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#22c55e',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
          }}>
            ✓
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '9px',
          color: 'var(--accent)',
          marginBottom: '0.3rem',
          letterSpacing: '0.05em',
        }}>
          {name}
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {types.map((t) => (
            <span key={t} className={`type-badge type-${t.toLowerCase()}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '8px',
        padding: '4px 10px',
        borderRadius: '3px',
        background: `${rarityColor}22`,
        border: `1px solid ${rarityColor}`,
        color: rarityColor,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {rarity}
      </div>

      {isOwned ? (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '8px',
          color: '#22c55e',
          letterSpacing: '0.1em',
        }}>
          DESBLOQUEADO
        </div>
      ) : (
        <button
          onClick={() => onBuy(pokedexId)}
          disabled={loading}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '8px',
            padding: '0.6rem 1.2rem',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#0a0a0f',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            letterSpacing: '0.08em',
            boxShadow: '0 0 16px rgba(255,215,0,0.3)',
          }}
        >
          {loading ? '...' : `$${(price / 100).toFixed(2)}`}
        </button>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
