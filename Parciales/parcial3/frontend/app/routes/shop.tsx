import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import { notify } from "../components/Toast";
import "../../styles/globals.css";

export default function Shop() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [skins, setSkins] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pieces" | "board">("all");

  const clerkId = user?.id || localStorage.getItem("clerkId") || "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.has("success");
    const claimedSkin = params.get("skinId");

    if (isSuccess) {
      notify("success", "Pago exitoso! Skin añadido a tu cuenta");
      window.history.replaceState({}, "", "/shop");

      if (clerkId && claimedSkin) {
        fetch("/api/payments/claim-skin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId, skinId: claimedSkin }),
        }).then(() => refreshData()).catch(() => {});
      }
    } else if (params.has("canceled")) {
      notify("warning", "Pago cancelado");
      window.history.replaceState({}, "", "/shop");
    }
  }, [clerkId]);

  const refreshData = () => {
    fetch("/api/payments/skins").then(r => r.json()).then(setSkins).catch(() => {}).finally(() => setLoading(false));
    if (clerkId) {
      fetch(`/api/auth/me?clerkId=${clerkId}`).then(r => r.ok && r.json()).then(setUserData).catch(() => {});
    }
  };

  useEffect(() => { refreshData(); }, [clerkId]);

  const handleBuy = async (skinId: string) => {
    if (!clerkId) {
      notify("info", "Inicia sesion para comprar");
      return navigate({ to: "/login" });
    }
    const res = await fetch("/api/payments/create-checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkId, skinId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    if (data.error) notify("error", data.error);
  };

  const handleActivate = async (skinId: string) => {
    if (!clerkId) return;
    const res = await fetch("/api/payments/activate-skin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkId, skinId }),
    });
    if (res.ok) {
      setUserData(await res.json());
      notify("success", "Skin activado");
    }
  };

  const owned = userData?.ownedSkins || [];
  const activeSkin = userData?.activeSkin || {};
  const filteredSkins = filter === "all" ? skins : skins.filter(s => s.type === filter);

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 24px',
      maxWidth: 900, margin: '0 auto',
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
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
              letterSpacing: '0.08em', color: 'var(--color-gold-light)',
            }}>TIENDA</h1>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
              color: 'var(--color-text-muted)', fontStyle: 'italic',
            }}>Personaliza tu estilo de juego</p>
          </div>
        </div>

        {!clerkId && (
          <div style={{
            padding: '12px 20px', marginTop: 16,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <Link to="/login" style={{ color: 'var(--color-gold-light)', fontWeight: 600 }}>Inicia sesion</Link> para comprar skins
            </span>
          </div>
        )}
      </div>

      <div className="animate-fade-in-up stagger-1" style={{
        display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32,
      }}>
        {[
          { value: "all" as const, label: "Todos" },
          { value: "pieces" as const, label: "Fichas" },
          { value: "board" as const, label: "Tableros" },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '10px 20px',
            background: filter === f.value ? 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)' : 'var(--color-surface)',
            border: '1px solid ' + (filter === f.value ? 'var(--color-gold)' : 'var(--color-border)'),
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
            color: filter === f.value ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            transition: 'all var(--transition)',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-2" style={{
        display: 'grid', gap: 16,
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filteredSkins.length === 0 ? (
          <div style={{
            padding: 48, textAlign: 'center',
            background: 'var(--color-glass)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No hay skins disponibles</p>
          </div>
        ) : filteredSkins.map((skin: any) => {
          const isOwned = owned.includes(skin.id);
          const isActive = activeSkin?.pieces === skin.id || activeSkin?.board === skin.id;
          return (
            <div key={skin.id} style={{
              display: 'flex', alignItems: 'center', gap: 20, padding: 20,
              background: 'var(--color-glass)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isActive ? 'var(--color-gold)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-xl)',
              transition: 'all var(--transition)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = isActive ? 'var(--color-gold)' : 'var(--color-border-strong)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = isActive ? 'var(--color-gold)' : 'var(--color-border)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  padding: '4px 10px',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.65rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--color-gold-light)',
                }}>Activo</div>
              )}
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--radius-lg)',
                background: `linear-gradient(135deg, ${skin.colors?.primary || '#333'} 0%, ${skin.colors?.secondary || '#111'} 50%, ${skin.colors?.accent || skin.colors?.primary || '#333'} 100%)`,
                flexShrink: 0,
                border: '2px solid var(--color-border)',
                boxShadow: `0 4px 16px ${skin.colors?.primary || '#333'}40`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '1rem', fontWeight: 600,
                  color: 'var(--color-text)', marginBottom: 4,
                }}>{skin.name}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                    {skin.type === 'pieces' ? 'Fichas' : 'Tablero'}
                  </span>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 600,
                    color: 'var(--color-gold-light)',
                  }}>${skin.price}</span>
                </div>
              </div>
              {isOwned ? (
                <button onClick={() => handleActivate(skin.id)} disabled={isActive} className="btn btn-secondary btn-sm" style={{
                  opacity: isActive ? 0.5 : 1,
                }}>
                  {isActive ? 'Activo' : 'Activar'}
                </button>
              ) : (
                <button onClick={() => handleBuy(skin.id)} className="btn btn-primary btn-sm">
                  Comprar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
