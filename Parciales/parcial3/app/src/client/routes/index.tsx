import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/board.css";

type Mode = "bot" | "multi";

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("bot");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlayBot = async () => {
    if (!name.trim()) return setError("Ingresa tu nombre");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rooms/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error);

      localStorage.setItem(`player_${data.code}`, data.playerId);
      navigate(`/game/${data.code}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return setError("Ingresa tu nombre");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error);

      localStorage.setItem(`player_${data.code}`, data.playerId);
      navigate(`/lobby/${data.code}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !joinCode.trim())
      return setError("Ingresa tu nombre y el código");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/rooms/${joinCode.trim()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error);

      localStorage.setItem(`player_${data.code}`, data.playerId);
      navigate(`/game/${data.code}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>
          DAMAS
          <span>Juego de Mesa</span>
        </h1>
        <p className="subtitle">Elige un modo de juego</p>
        <div className="ornament" aria-hidden="true" />
      </div>

      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === "bot" ? "active" : ""}`}
          onClick={() => { setMode("bot"); setError(""); }}
        >
          <span className="mode-tab-icon">⚔</span>
          1 vs Máquina
        </button>
        <button
          className={`mode-tab ${mode === "multi" ? "active" : ""}`}
          onClick={() => { setMode("multi"); setError(""); }}
        >
          <span className="mode-tab-icon">👥</span>
          Multijugador
        </button>
      </div>

      <div className="home-card">
        {mode === "bot" ? (
          <>
            <div className="field">
              <label htmlFor="name">Tu nombre</label>
              <input
                id="name"
                placeholder="Ej: Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlayBot()}
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-primary btn-full"
              onClick={handlePlayBot}
              disabled={loading}
            >
              {loading ? "..." : "Jugar contra la Máquina"}
            </button>

            <p className="bot-hint">
              Jugarás como <strong>Rojas</strong>
            </p>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="name">Tu nombre</label>
              <input
                id="name"
                placeholder="Ej: Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="code">Código de sala</label>
              <input
                id="code"
                placeholder="Para unirte a una sala"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="btn-group">
              <button
                className="btn btn-primary btn-full"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "..." : "Crear sala"}
              </button>

              <div className="divider">o</div>

              <button
                className="btn btn-secondary btn-full"
                onClick={handleJoin}
                disabled={loading}
              >
                Unirse a sala
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
