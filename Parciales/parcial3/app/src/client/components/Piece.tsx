interface PieceProps {
  type: string | null;
  selected: boolean;
  playable: boolean;
}

export default function Piece({ type, selected, playable }: PieceProps) {
  if (!type) return null;

  const isRed = type === "r" || type === "rk";
  const isKing = type === "rk" || type === "bk";

  let className = "piece";
  className += isRed ? " red" : " black";
  if (selected) className += " selected";
  if (isKing) className += " king";
  if (playable) className += " playable";

  return <div className={className} />;
}
