import { useNavigate } from "react-router-dom";

interface GameOverOverlayProps {
  status: string;
  playerColor: string | null;
  moveCount: number;
}

export default function GameOverOverlay({ status, playerColor, moveCount }: GameOverOverlayProps) {
  const navigate = useNavigate();

  const winner =
    status === "red_wins" ? "Rojas" :
    status === "black_wins" ? "Negras" :
    null;

  const iWon = playerColor ===
    (status === "red_wins" ? "red" : status === "black_wins" ? "black" : null);
  const isDraw = status === "draw";

  return (
    <div className="overlay-backdrop">
      <div className="overlay-card">
        <div className="overlay-ornament" />

        {isDraw ? (
          <div className="overlay-result">
            <div className="overlay-label">Empate</div>
            <p className="overlay-sub">Nadie gana esta partida</p>
          </div>
        ) : (
          <div className="overlay-result">
            <div className="overlay-label">
              {iWon ? "Victoria" : "Derrota"}
            </div>
            <div className={`overlay-winner ${winner?.toLowerCase()}`}>
              {winner === "Rojas" ? "Rojas" : "Negras"}
            </div>
            <p className="overlay-sub">
              {iWon ? "Has ganado la partida!" : "Has perdido la partida"}
            </p>
          </div>
        )}

        <div className="overlay-stats">
          <div className="overlay-stat">
            <span className="overlay-stat-label">Movimientos</span>
            <span className="overlay-stat-value">{moveCount}</span>
          </div>
          <div className="overlay-stat">
            <span className="overlay-stat-label">Jugaste como</span>
            <span className="overlay-stat-value">
              {playerColor === "red" ? "Rojas" : playerColor === "black" ? "Negras" : "—"}
            </span>
          </div>
        </div>

        <div className="overlay-actions">
          <button className="btn btn-primary btn-full" onClick={() => navigate("/")}>
            Volver al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}
