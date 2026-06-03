import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/board.css";

interface Player {
  name: string;
  color: string;
}

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          clearInterval(interval);
          return;
        }

        setPlayers(data.players);

        if (data.status === "playing") {
          clearInterval(interval);
          navigate(`/game/${code}`);
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [code, navigate]);

  return (
    <div className="lobby-page">
      {error ? (
        <>
          <h1>Error</h1>
          <p className="error-message">{error}</p>
        </>
      ) : (
        <>
          <h1>Sala de juego</h1>
          <div className="lobby-code">{code}</div>
          <p className="lobby-hint">Comparte este código con un amigo</p>

          <div className="lobby-players">
            <h2>Jugadores</h2>
            {players.map((p, i) => (
              <div key={i} className="player-entry">
                <div className={`player-dot ${p.color}`} />
                <span>
                  {p.name}{" "}
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>
                    ({p.color === "red" ? "Rojas" : "Negras"})
                  </span>
                </span>
              </div>
            ))}
            {players.length < 2 && (
              <div className="player-waiting">Esperando oponente...</div>
            )}
          </div>

          {players.length < 2 && <div className="lobby-spinner" />}
        </>
      )}
    </div>
  );
}
