import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import "../../styles/globals.css";

export default function Leaderboard() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then(r => r.json())
      .then(data => { setRankings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const medalColors = ['var(--color-gold)', '#c0c0c0', '#cd7f32'];

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 24px',
      maxWidth: 800, margin: '0 auto',
    }}>
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <path d="M8 21h8M12 17v4M7 4h10l-1 8H8L7 4zM5 4h14"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
              letterSpacing: '0.08em', color: 'var(--color-gold-light)',
            }}>RANKING GLOBAL</h1>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
              color: 'var(--color-text-muted)', fontStyle: 'italic',
            }}>Los mejores jugadores</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-1" style={{
        background: 'var(--color-glass)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 70px',
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.7rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--color-text-muted)',
        }}>
          <span>#</span>
          <span>Jugador</span>
          <span style={{ textAlign: 'center' }}>Victorias</span>
          <span style={{ textAlign: 'center' }}>Derrotas</span>
          <span style={{ textAlign: 'right' }}>%</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : rankings.length === 0 ? (
          <div style={{
            padding: 48, textAlign: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" strokeWidth="1" style={{ margin: '0 auto 16px' }}>
              <path d="M8 21h8M12 17v4M7 4h10l-1 8H8L7 4zM5 4h14"/>
            </svg>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No hay jugadores en el ranking aun
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', marginTop: 8 }}>
              Se el primero en jugar!
            </p>
          </div>
        ) : rankings.map((r, i) => {
          const winRate = r.totalGames > 0 ? Math.round((r.wins / r.totalGames) * 100) : 0;
          const isTop3 = i < 3;
          return (
            <div key={r.clerkId || i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 70px',
              alignItems: 'center', padding: '14px 20px',
              borderBottom: i < rankings.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              background: isTop3 ? `rgba(201,168,76,${0.08 - i * 0.02})` : 'transparent',
              transition: 'background var(--transition)',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = isTop3 ? `rgba(201,168,76,${0.08 - i * 0.02})` : 'transparent'; }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isTop3 ? (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${medalColors[i]}, ${medalColors[i]}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem',
                    color: 'var(--color-bg)',
                    boxShadow: `0 0 12px ${medalColors[i]}40`,
                  }}>{i + 1}</div>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600,
                    color: 'var(--color-text-muted)', fontSize: '0.9rem',
                  }}>{i + 1}</span>
                )}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-gold-dark), var(--color-bg-alt))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
                  color: 'var(--color-gold-light)',
                  border: '1px solid var(--color-border)',
                }}>
                  {(r.name || r.clerkId || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{
                  fontWeight: 500, fontSize: '0.9rem',
                  color: 'var(--color-text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.name || r.clerkId}</span>
              </div>
              <span style={{
                textAlign: 'center', fontWeight: 600, fontSize: '0.9rem',
                color: 'var(--color-success)',
              }}>{r.wins}</span>
              <span style={{
                textAlign: 'center', fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
              }}>{r.losses}</span>
              <span style={{
                textAlign: 'right', fontWeight: 600, fontSize: '0.9rem',
                color: winRate >= 60 ? 'var(--color-success)' : winRate >= 40 ? 'var(--color-warning)' : 'var(--color-text-muted)',
              }}>{winRate}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
