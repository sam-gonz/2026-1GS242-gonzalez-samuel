interface Props {
  type: string
}

export default function TypeBadge({ type }: Props) {
  return <span className={`type-badge type-${type}`}>{type}</span>
}
