import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";

interface SubMenuItem {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: string;
  danger?: boolean;
}

interface MenuItem {
  label: string;
  to?: string;
  children?: SubMenuItem[];
}

export default function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("clerkId"));
  const [userName, setUserName] = useState(() => localStorage.getItem("clerkName") || "");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => {
      const loggedIn = !!localStorage.getItem("clerkId");
      setIsLoggedIn(loggedIn);
      if (loggedIn) setUserName(localStorage.getItem("clerkName") || "");
    };
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem("clerkId");
    localStorage.removeItem("clerkName");
    try { await signOut(); } catch {}
    window.dispatchEvent(new CustomEvent("auth-changed"));
    navigate({ to: "/login" });
  };

  const menuItems: MenuItem[] = [
    { label: "Inicio", to: "/" },
    { label: "Tienda", to: "/shop" },
    { label: "Ranking", to: "/leaderboard" },
    { label: "Reglas", to: "/rules" },
  ];

  const accountMenu: SubMenuItem[] = [
    { label: "Mi Perfil", to: "/profile", icon: "user" },
    { label: "Configuracion", to: "/settings", icon: "settings" },
    { label: "Mis Partidas", to: "/profile", icon: "history" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav ref={navRef} style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(8,8,16,0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-gold-dark), transparent)',
        opacity: 0.5,
      }} />

      <div style={{
        maxWidth: 1400, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 72,
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          textDecoration: 'none', position: 'relative',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201,168,76,0.3)',
            position: 'relative',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-red-light) 0%, var(--color-red-dark) 100%)',
                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
              }} />
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
              letterSpacing: '0.15em', color: 'var(--color-gold-light)',
              lineHeight: 1,
            }}>DAMAS</div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.65rem',
              letterSpacing: '0.3em', color: 'var(--color-text-muted)',
              textTransform: 'uppercase', marginTop: 2,
            }}>Juego de Mesa</div>
          </div>
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
        }} className="nav-desktop">
          {menuItems.map(item => (
            <Link key={item.label} to={item.to || "/"} style={{
              padding: '10px 18px',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
              color: isActive(item.to || "/") ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              background: isActive(item.to || "/") ? 'rgba(201,168,76,0.08)' : 'transparent',
              transition: 'all var(--transition)',
              position: 'relative',
            }}
            onMouseOver={e => {
              if (!isActive(item.to || "/")) {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
              }
            }}
            onMouseOut={e => {
              if (!isActive(item.to || "/")) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
              }
            }}>
              {item.label}
              {isActive(item.to || "/") && (
                <div style={{
                  position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 2, borderRadius: 1,
                  background: 'var(--color-gold)',
                }} />
              )}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLoggedIn ? (
            <>
              <Link to="/settings" style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)',
                transition: 'all var(--transition)',
                background: 'transparent',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </Link>

              <div style={{ position: 'relative' }}>
                <button onClick={() => setOpenMenu(openMenu === 'account' ? null : 'account')} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px 6px 6px',
                  background: openMenu === 'account' ? 'var(--color-surface)' : 'transparent',
                  border: '1px solid ' + (openMenu === 'account' ? 'var(--color-border-strong)' : 'var(--color-border)'),
                  borderRadius: 'var(--radius-full)',
                  transition: 'all var(--transition)',
                }}
                onMouseOver={e => {
                  if (openMenu !== 'account') {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
                  }
                }}
                onMouseOut={e => {
                  if (openMenu !== 'account') {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  }
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
                    color: 'var(--color-bg)',
                  }}>
                    {userName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
                    color: 'var(--color-text)', maxWidth: 100,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{userName || 'Usuario'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
                    transform: openMenu === 'account' ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform var(--transition)',
                  }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {openMenu === 'account' && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: 220,
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                    animation: 'fadeInDown 0.2s var(--ease-out)',
                  }}>
                    <div style={{
                      padding: '16px', borderBottom: '1px solid var(--color-border)',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                        color: 'var(--color-text)',
                      }}>{userName || 'Usuario'}</div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                        color: 'var(--color-text-muted)', marginTop: 2,
                      }}>Cuenta activa</div>
                    </div>

                    <div style={{ padding: '8px' }}>
                      {accountMenu.map((item, i) => (
                        <button key={i} onClick={() => {
                          if (item.to) navigate({ to: item.to });
                          setOpenMenu(null);
                        }} style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px',
                          background: 'transparent',
                          borderRadius: 'var(--radius-md)',
                          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                          color: 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                          textAlign: 'left',
                        }}
                        onMouseOver={e => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                        }}
                        onMouseOut={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                        }}>
                          <span style={{ opacity: 0.6 }}>{getIcon(item.icon || "")}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: '8px', borderTop: '1px solid var(--color-border)' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                        background: 'transparent',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        color: 'var(--color-error)',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left',
                      }}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)';
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}>
                        <span style={{ opacity: 0.8 }}>{getIcon("logout")}</span>
                        Cerrar Sesion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--color-bg)',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
              transition: 'all var(--transition)',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(201,168,76,0.4)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(201,168,76,0.3)';
            }}>
              Iniciar Sesion
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function getIcon(name: string) {
  const icons: Record<string, React.ReactNode> = {
    user: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
    history: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    logout: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };
  return icons[name] || null;
}
