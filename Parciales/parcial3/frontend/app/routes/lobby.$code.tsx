import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import "../../styles/globals.css";

interface Player { name: string; color: string; }

export default function Lobby() {
  const { code } = useParams({ from: "/lobby/$code" });
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error); clearInterval(interval); return; }
        setPlayers(data.players);
        if (data.status === "playing") { clearInterval(interval); navigate({ to: `/game/${code}` }); }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [code, navigate]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: '40px 24px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '30%', left: '40%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
      </div>

      <div className="animate-fade-in-down" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-text-muted)', marginBottom: 12,
        }}>Sala de juego</h1>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(2rem, 6vw, 3rem)', letterSpacing: '0.2em',
          color: 'var(--color-gold-light)',
          textShadow: '0 0 40px var(--color-gold-glow)',
          marginBottom: 8,
        }}>{code}</div>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.95rem',
          color: 'var(--color-text-muted)', fontStyle: 'italic',
        }}>Comparte este codigo con un amigo</p>
      </div>

      <div className="animate-fade-in-up stagger-2 card" style={{
        padding: 24, minWidth: 280, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: 'var(--color-text-muted)', marginBottom: 16,
        }}>Jugadores</div>

        {players.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderBottom: i < players.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: p.color === 'red'
                ? 'radial-gradient(circle at 40% 35%, #e85c50, #c43a32)'
                : 'radial-gradient(circle at 40% 35%, #404060, #1a1a2e)',
              boxShadow: p.color === 'red'
                ? '0 0 8px rgba(196,58,50,0.4)'
                : '0 0 8px rgba(26,26,46,0.4)',
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.name}</span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
            }}>({p.color === 'red' ? 'Rojas' : 'Negras'})</span>
          </div>
        ))}

        {players.length < 2 && (
          <div style={{
            fontSize: '0.85rem', color: 'var(--color-text-dim)',
            fontStyle: 'italic', padding: '12px 0',
          }}>Esperando oponente...</div>
        )}
      </div>

      {players.length < 2 && (
        <div className="animate-fade-in stagger-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="spinner" />
        </div>
      )}

      {error && <div className="error-message" style={{ position: 'relative', zIndex: 1 }}>{error}</div>}
    </div>
  );
}
