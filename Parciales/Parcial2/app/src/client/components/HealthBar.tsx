interface Props {
  current: number
  max: number
  showNumbers?: boolean
}

export default function HealthBar({ current, max, showNumbers = true }: Props) {
  const pct = Math.max(0, current / max) * 100
  const colorClass = pct > 50 ? 'hp-bar--high' : pct > 20 ? 'hp-bar--mid' : 'hp-bar--low'

  return (
    <div style={{ width: '100%' }}>
      {showNumbers && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: 'var(--text-muted)', marginBottom: '3px' }}>
          HP {current} / {max}
        </div>
      )}
      <div className="hp-bar-wrap">
        <div className={`hp-bar ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
