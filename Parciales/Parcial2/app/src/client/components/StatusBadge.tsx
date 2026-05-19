const LABELS: Record<string, string> = {
  burn:      'BRN',
  poison:    'PSN',
  paralysis: 'PAR',
  sleep:     'SLP',
  freeze:    'FRZ',
}

interface Props {
  status: { name: string; remainingTurns: number } | null
}

export default function StatusBadge({ status }: Props) {
  if (!status) return null
  return (
    <span className={`status-badge status-${status.name}`}>
      {LABELS[status.name] ?? status.name.toUpperCase()} ({status.remainingTurns}T)
    </span>
  )
}
