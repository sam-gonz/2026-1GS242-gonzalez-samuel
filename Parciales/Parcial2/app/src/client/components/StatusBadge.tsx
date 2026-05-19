const ICONS: Record<string, string> = {
  burn:      '🔥',
  poison:    '☠️',
  paralysis: '⚡',
  sleep:     '💤',
  freeze:    '❄️',
}

interface Props {
  status: { name: string; remainingTurns: number } | null
}

export default function StatusBadge({ status }: Props) {
  if (!status) return null
  return (
    <span className={`status-badge status-${status.name}`}>
      {ICONS[status.name] ?? ''} {status.name.toUpperCase()} ({status.remainingTurns}T)
    </span>
  )
}
