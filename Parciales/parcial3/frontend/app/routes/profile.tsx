import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import "../../styles/globals.css";

const SKIN_NAMES: Record<string, string> = {
  "gold-pieces": "Fichas Doradas", "crystal-pieces": "Fichas de Cristal",
  "neon-pieces": "Fichas Neon", "marble-board": "Tablero Marmol",
  "dark-wood": "Tablero Roble Oscuro",
};

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const clerkId = user?.id || (typeof window !== "undefined" ? localStorage.getItem("clerkId") : null) || "";

  const handleLogout = async () => {
    localStorage.removeItem("clerkId");
    localStorage.removeItem("clerkName");
    await signOut();
    window.dispatchEvent(new CustomEvent("auth-changed"));
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!clerkId) return;
    fetch("/api/ranking/me?clerkId=" + clerkId).then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/auth/me?clerkId=" + clerkId).then(r => r.ok && r.json()).then(setUserData).catch(() => {});
    fetch("/api/ranking/history?clerkId=" + clerkId).then(r => r.json()).then(setHistory).catch(() => {});
  }, [clerkId]);

  const totalGames = stats?.totalGames || 0;
  const wins = stats?.wins || 0;
  const losses = stats?.losses || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const activeSkin = userData?.activeSkin || {};

  if (!clerkId) return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
        color: 'var(--color-text-muted)', fontStyle: 'italic',
      }}>
        <Link to="/login" style={{ color: 'var(--color-gold-light)', fontWeight: 600 }}>Inicia sesion</Link> para ver tu perfil
      </div>
      <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 24px',
      maxWidth: 800, margin: '0 auto',
    }}>
      <div className="animate-fade-in-up" style={{
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
          color: 'var(--color-bg)',
          boxShadow: '0 0 30px rgba(201,168,76,0.3)',
        }}>
          {(userData?.name || clerkId).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
            letterSpacing: '0.08em', color: 'var(--color-gold-light)',
          }}>{(userData?.name || clerkId).toUpperCase()}</h1>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
            color: 'var(--color-text-muted)', fontStyle: 'italic',
          }}>Perfil de jugador</p>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-1" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Partidas', value: totalGames, color: 'var(--color-text)' },
          { label: 'Victorias', value: wins, color: 'var(--color-success)' },
          { label: 'Derrotas', value: losses, color: 'var(--color-error)' },
          { label: 'Win Rate', value: winRate + '%', color: winRate >= 50 ? 'var(--color-success)' : 'var(--color-warning)' },
          { label: 'Movimientos', value: stats?.totalMoves || 0, color: 'var(--color-info)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--color-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 16px',
            textAlign: 'center',
            transition: 'all var(--transition)',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}>
            <div style={{
              fontSize: '1.8rem', fontWeight: 700,
              color: s.color, marginBottom: 4,
            }}>{s.value}</div>
            <div style={{
              fontSize: '0.7rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-2" style={{
        display: 'grid', gap: 20,
      }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <h2 style={{
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
            }}>Skins Activas</h2>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Tablero</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gold-light)' }}>
                {activeSkin.board ? SKIN_NAMES[activeSkin.board] || activeSkin.board : 'Predeterminado'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Fichas</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gold-light)' }}>
                {activeSkin.pieces ? SKIN_NAMES[activeSkin.pieces] || activeSkin.pieces : 'Predeterminado'}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <h2 style={{
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
            }}>Historial de Partidas</h2>
          </div>
          {history.length === 0 ? (
            <div style={{
              padding: '20px 0', textAlign: 'center',
              color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem',
            }}>Sin partidas aun</div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < history.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: h.result === 'win' ? 'var(--color-success)' : h.result === 'loss' ? 'var(--color-error)' : 'var(--color-warning)',
                    }} />
                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{h.opponentName}</span>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {h.moves} mov. - {new Date(h.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32,
      }}>
        <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
        <Link to="/shop" className="btn btn-secondary">Ir a la Tienda</Link>
        <button onClick={handleLogout} className="btn btn-danger">Cerrar Sesion</button>
      </div>
    </div>
  );
}
