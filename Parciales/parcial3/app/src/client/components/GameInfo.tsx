interface GameInfoProps {
  turn: string;
  status: string;
  playerColor: string | null;
  moveCount: number;
  isBotGame?: boolean;
  onResign: () => void;
}

export default function GameInfo({ turn, status, playerColor, moveCount, isBotGame, onResign }: GameInfoProps) {
  const isMyTurn = playerColor === turn;

  const winner =
    status === "red_wins" ? "Rojas" :
    status === "black_wins" ? "Negras" :
    null;

  const iWon = playerColor ===
    (status === "red_wins" ? "red" : status === "black_wins" ? "black" : null);

  if (status !== "active") {
    return (
      <div className="game-panel">
        <div className="game-status-banner">
          <div className="result">
            {winner === "Rojas" ? "Ganan las Rojas" :
             winner === "Negras" ? "Ganan las Negras" :
             "Empate"}
          </div>
          <div className="result-sub">
            {iWon ? (isBotGame ? "Ganaste a la Máquina!" : "Has ganado!") :
             playerColor ? (isBotGame ? "La Máquina te ganó" : "Has perdido") : ""}
          </div>
          <div className="game-stat" style={{ marginTop: "0.75rem", borderTop: "none" }}>
            <span className="game-stat-label">Movimientos</span>
            <span className="game-stat-value">{moveCount}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-panel">
      <div className="panel-title">Turno</div>

      <div className="turn-display">
        <div className={`turn-puck ${turn}`} />
        <div className={`turn-label ${turn}`}>
          {turn === "red" ? "Rojas" : "Negras"}
        </div>
      </div>

      <div className={`turn-status ${isMyTurn ? "is-my-turn" : ""}`}>
        {isMyTurn ? "Tu turno" : isBotGame ? "Máquina pensando..." : "Esperando oponente..."}
      </div>

      <div className="game-stat">
        <span className="game-stat-label">Movimientos</span>
        <span className="game-stat-value">{moveCount}</span>
      </div>

      <div className="game-stat">
        <span className="game-stat-label">Eres</span>
        <span className="game-stat-value">
          {playerColor === "red" ? "Rojas" :
           playerColor === "black" ? "Negras" : "—"}
        </span>
      </div>

      {!isBotGame && (
        <button
          className="btn btn-danger btn-full btn-sm"
          style={{ marginTop: "0.75rem" }}
          onClick={onResign}
        >
          Rendirse
        </button>
      )}
    </div>
  );
}
