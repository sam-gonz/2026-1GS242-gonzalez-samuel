import { useEffect, useRef } from 'react'

interface LogEntry {
  turn: number
  message: string
}

function entryClass(msg: string) {
  if (msg.includes('super efectivo'))  return 'log-entry log-entry--super'
  if (msg.includes('No tiene efecto')) return 'log-entry log-entry--immune'
  if (msg.includes('crítico'))         return 'log-entry log-entry--critical'
  if (msg.includes('debilit'))         return 'log-entry log-entry--faint'
  if (msg.includes('switch') || msg.includes('cambi')) return 'log-entry log-entry--switch'
  if (msg.includes('ganó'))            return 'log-entry log-entry--win'
  return 'log-entry'
}

interface Props {
  entries: LogEntry[]
}

export default function BattleLog({ entries }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])

  return (
    <div className="battle-log" ref={ref}>
      {entries.length === 0 && (
        <p className="log-entry">¡La batalla comienza! Elige tu acción.</p>
      )}
      {entries.slice(-30).map((e, i) => (
        <div key={i} className={entryClass(e.message)}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>T{e.turn}.</span>
          {e.message}
        </div>
      ))}
    </div>
  )
}
