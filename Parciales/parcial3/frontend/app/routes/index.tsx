import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { notify } from "../components/Toast";
import "../../styles/globals.css";

type Mode = "bot" | "multi";
type GameType = "classic" | "rush";
type Difficulty = "easy" | "normal" | "hard" | "expert";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: "easy", label: "Facil", desc: "Para principiantes", color: "#6b8e23" },
  { value: "normal", label: "Normal", desc: "Experiencia balanceada", color: "#4682b4" },
  { value: "hard", label: "Dificil", desc: "Para jugadores avanzados", color: "#b8860b" },
  { value: "expert", label: "Experto", desc: "Sin piedad", color: "#8b0000" },
];

const RUSH_TIMES = [
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
];

export default function Home() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<Mode>("bot");
  const [gameType, setGameType] = useState<GameType>("classic");
  const [rushTime, setRushTime] = useState(300);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("clerkId"));
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("clerkName");
    if (savedName && !name) setName(savedName);
    const handler = () => {
      const loggedIn = !!localStorage.getItem("clerkId");
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const n = localStorage.getItem("clerkName");
        if (n) setName(n);
      }
    };
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  useEffect(() => {
    const clerkId = localStorage.getItem("clerkId");
    if (clerkId) {
      fetch("/api/ranking/me?clerkId=" + clerkId)
        .then(r => r.ok ? r.json() : null)
        .then(setUserStats)
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const clerkId = typeof window !== "undefined" ? localStorage.getItem("clerkId") || undefined : undefined;

  const handlePlayBot = async () => {
    if (!name.trim()) {
      notify("warning", "Ingresa tu nombre para jugar");
      return setError("Ingresa tu nombre");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/rooms/bot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          clerkId, 
          difficulty,
          gameMode: gameType,
          timeLimit: gameType === "rush" ? rushTime : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      localStorage.setItem(`player_${data.code}`, data.playerId);
      notify("success", gameType === "rush" ? "Partida Rush iniciada!" : "Partida iniciada contra la Maquina");
      navigate({ to: `/game/${data.code}` });
    } catch { 
      notify("error", "Error de conexion");
      setError("Error de conexion"); 
    }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      notify("warning", "Ingresa tu nombre");
      return setError("Ingresa tu nombre");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), clerkId }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      localStorage.setItem(`player_${data.code}`, data.playerId);
      notify("success", "Sala creada: " + data.code);
      navigate({ to: `/lobby/${data.code}` });
    } catch { 
      notify("error", "Error de conexion");
      setError("Error de conexion"); 
    }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim() || !joinCode.trim()) {
      notify("warning", "Ingresa tu nombre y el codigo");
      return setError("Ingresa tu nombre y el codigo");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${joinCode.trim()}/join`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), clerkId }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      localStorage.setItem(`player_${data.code}`, data.playerId);
      notify("success", "Te uniste a la sala");
      navigate({ to: `/game/${data.code}` });
    } catch { 
      notify("error", "Error de conexion");
      setError("Error de conexion"); 
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,58,50,0.06) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            borderRadius: '50%',
            background: `rgba(201,168,76,${0.1 + Math.random() * 0.2})`,
            animation: `particleFloat ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            ['--tx' as any]: `${(Math.random() - 0.5) * 200}px`,
            ['--ty' as any]: `${-100 - Math.random() * 200}px`,
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        padding: '40px 24px',
      }}>
        <div className="animate-fade-in-up" style={{
          textAlign: 'center', marginBottom: 48,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 'var(--radius-full)',
            marginBottom: 20,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--color-gold)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 500,
              color: 'var(--color-gold-light)', letterSpacing: '0.05em',
            }}>
              {isLoggedIn ? 'Bienvenido de vuelta' : 'Juego de estrategia clasico'}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            letterSpacing: '0.1em',
            color: 'var(--color-text)',
            lineHeight: 1,
            marginBottom: 12,
            textShadow: '0 0 60px rgba(201,168,76,0.2)',
          }}>
            DAMAS
          </h1>
          
          <div style={{
            width: 80, height: 2, margin: '0 auto 16px',
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
          }} />
          
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            maxWidth: 500, margin: '0 auto',
          }}>
            Desafía a la máquina o a otros jugadores en este clásico juego de estrategia
          </p>
        </div>

        {isLoggedIn && userStats && (
          <div className="animate-fade-in-up stagger-1" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px',
          }}>
            {[
              { label: 'Partidas', value: userStats.totalGames || 0, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { label: 'Victorias', value: userStats.wins || 0, icon: 'M12 15l-2-2-4 4h12l-4-4-2 2z M6 3h12v4l-2 2-2-2-2 2-2-2-2 2V3z', color: 'var(--color-success)' },
              { label: 'Derrotas', value: userStats.losses || 0, icon: 'M18 6L6 18M6 6l12 12', color: 'var(--color-error)' },
              { label: 'Win Rate', value: (userStats.totalGames > 0 ? Math.round((userStats.wins / userStats.totalGames) * 100) : 0) + '%', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--color-glass)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
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
                  fontSize: '1.5rem', fontWeight: 700,
                  color: stat.color || 'var(--color-gold-light)',
                  marginBottom: 4,
                }}>{stat.value}</div>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--color-text-muted)',
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="animate-fade-in-up stagger-2" style={{
          display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32,
        }}>
          <button onClick={() => setMode("bot")} style={{
            padding: '14px 28px',
            background: mode === 'bot' ? 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)' : 'var(--color-surface)',
            border: '1px solid ' + (mode === 'bot' ? 'var(--color-gold)' : 'var(--color-border)'),
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
            color: mode === 'bot' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            transition: 'all var(--transition)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="3"/>
              <line x1="8" y1="16" x2="8" y2="16"/>
              <line x1="16" y1="16" x2="16" y2="16"/>
            </svg>
            1 vs Maquina
          </button>
          <button onClick={() => setMode("multi")} style={{
            padding: '14px 28px',
            background: mode === 'multi' ? 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)' : 'var(--color-surface)',
            border: '1px solid ' + (mode === 'multi' ? 'var(--color-gold)' : 'var(--color-border)'),
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
            color: mode === 'multi' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            transition: 'all var(--transition)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Multijugador
          </button>
        </div>

        {mode === "bot" && (
          <div className="animate-fade-in-up stagger-2" style={{
            display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32,
          }}>
            <button onClick={() => setGameType("classic")} style={{
              padding: '10px 20px',
              background: gameType === 'classic' ? 'rgba(184,134,11,0.2)' : 'var(--color-surface)',
              border: '1px solid ' + (gameType === 'classic' ? 'var(--color-gold)' : 'var(--color-border)'),
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
              color: gameType === 'classic' ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
              transition: 'all var(--transition)',
            }}>
              Clasico
            </button>
            <button onClick={() => setGameType("rush")} style={{
              padding: '10px 20px',
              background: gameType === 'rush' ? 'rgba(139,0,0,0.3)' : 'var(--color-surface)',
              border: '1px solid ' + (gameType === 'rush' ? 'var(--color-red)' : 'var(--color-border)'),
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
              color: gameType === 'rush' ? 'var(--color-red-light)' : 'var(--color-text-secondary)',
              transition: 'all var(--transition)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Rush
            </button>
          </div>
        )}

        {mode === "bot" && gameType === "rush" && (
          <div className="animate-fade-in-up stagger-2" style={{
            display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32,
          }}>
            {RUSH_TIMES.map(t => (
              <button key={t.value} onClick={() => setRushTime(t.value)} style={{
                padding: '8px 16px',
                background: rushTime === t.value ? 'rgba(139,0,0,0.3)' : 'var(--color-surface)',
                border: '1px solid ' + (rushTime === t.value ? 'var(--color-red)' : 'var(--color-border)'),
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
                color: rushTime === t.value ? 'var(--color-red-light)' : 'var(--color-text-secondary)',
                transition: 'all var(--transition)',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="animate-fade-in-up stagger-3" style={{
          maxWidth: 440, margin: '0 auto',
          background: 'var(--color-glass)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 32,
          position: 'relative',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div className="deco-corner deco-corner-tl" />
          <div className="deco-corner deco-corner-tr" />
          <div className="deco-corner deco-corner-bl" />
          <div className="deco-corner deco-corner-br" />

          {isLoggedIn ? (
            <div style={{
              marginBottom: 24, padding: '14px 18px',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                color: 'var(--color-bg)',
              }}>
                {name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--color-text-muted)', marginBottom: 2,
                }}>Jugando como</div>
                <div style={{
                  fontSize: '1.1rem', fontWeight: 600,
                  color: 'var(--color-gold-light)',
                }}>{name}</div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'var(--color-text-muted)', marginBottom: 10,
              }}>Tu nombre</label>
              <input value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'bot' ? handlePlayBot() : handleCreate())}
                placeholder="Ingresa tu nombre" autoFocus
                className="input" />
            </div>
          )}

          {mode === "bot" && (
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'var(--color-text-muted)', marginBottom: 12,
              }}>Dificultad</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setDifficulty(opt.value)} style={{
                    padding: '14px 12px',
                    background: difficulty === opt.value ? `${opt.color}15` : 'var(--color-bg-alt)',
                    border: `1px solid ${difficulty === opt.value ? opt.color : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition)',
                    textAlign: 'left',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: opt.color,
                        boxShadow: difficulty === opt.value ? `0 0 8px ${opt.color}` : 'none',
                      }} />
                      <span style={{
                        fontSize: '0.85rem', fontWeight: 600,
                        color: difficulty === opt.value ? opt.color : 'var(--color-text)',
                      }}>{opt.label}</span>
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      paddingLeft: 16,
                    }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "multi" && (
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'var(--color-text-muted)', marginBottom: 10,
              }}>Codigo de sala</label>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Para unirte a una partida"
                className="input"
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {mode === "bot" ? (
            <>
              <button onClick={handlePlayBot} disabled={loading} className="btn btn-primary" style={{
                width: '100%', padding: '16px',
                fontSize: '0.95rem',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="spinner spinner-sm" />
                    Iniciando...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    Jugar contra la Maquina
                  </>
                )}
              </button>
              <p style={{
                textAlign: 'center', fontSize: '0.75rem',
                color: 'var(--color-text-muted)', marginTop: 12,
              }}>
                Jugaras como <strong style={{ color: 'var(--color-red-light)' }}>Rojas</strong>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleCreate} disabled={loading} className="btn btn-primary" style={{
                width: '100%', padding: '16px', marginBottom: 12,
                fontSize: '0.95rem',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="spinner spinner-sm" />
                    Creando...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Crear sala
                  </>
                )}
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '16px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: 'var(--color-text-muted)',
                }}>o</span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>

              <button onClick={handleJoin} disabled={loading || !joinCode.trim()} className="btn btn-secondary" style={{
                width: '100%', padding: '14px',
                opacity: !joinCode.trim() ? 0.5 : 1,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
                Unirse a sala
              </button>
            </>
          )}
        </div>

        <div className="animate-fade-in-up stagger-4" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginTop: 48, maxWidth: 700, margin: '48px auto 0',
        }}>
          {[
            { to: '/shop', label: 'Tienda de Skins', desc: 'Personaliza tu estilo', icon: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01' },
            { to: '/leaderboard', label: 'Ranking Global', desc: 'Compite por el primer lugar', icon: 'M8 21h8M12 17v4M7 4h10l-1 8H8L7 4zM5 4h14' },
            { to: '/rules', label: 'Reglas del Juego', desc: 'Aprende a jugar', icon: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z' },
          ].map((item, i) => (
            <a key={i} href={item.to} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 20px',
              background: 'var(--color-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              textDecoration: 'none',
              transition: 'all var(--transition)',
              textAlign: 'center',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                  <path d={item.icon}/>
                </svg>
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                color: 'var(--color-text)', marginBottom: 4,
              }}>{item.label}</div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
