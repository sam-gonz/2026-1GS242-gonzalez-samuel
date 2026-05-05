import { Link, NavLink } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, SignInButton, useAuth, useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '../lib/api'
import { useState } from 'react'

function NotifBadge() {
  const apiFn = useApi()
  const { isSignedIn } = useAuth()
  const { data } = useQuery({
    queryKey: ['notif-summary'],
    queryFn: () => apiFn.notifications.summary(),
    enabled: !!isSignedIn,
    refetchInterval: 30_000,
    staleTime: 20_000,
  })
  const total = data?.total ?? 0
  if (!total) return null
  return (
    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
      {total > 9 ? '9+' : total}
    </span>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user } = useUser()

  // Detecta si el usuario logueado es admin via Clerk publicMetadata
  const isAdmin = user?.publicMetadata?.role === 'admin'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-white transition-colors ${isActive ? 'text-white font-medium' : 'text-[var(--color-muted)]'}`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--color-brand)]/20 text-white border border-[var(--color-brand)]/30'
        : 'text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)]'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl">🃏</span>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            TradeUp
            <span className="text-[var(--color-brand-light)] ml-1 text-sm font-normal">TCG</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink>
          <NavLink to="/store" className={linkClass}>Tienda</NavLink>
          <SignedIn>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <div className="relative">
              <NavLink to="/orders" className={linkClass}>Mis Pedidos</NavLink>
              <SignedIn><NotifBadge /></SignedIn>
            </div>
          </SignedIn>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              to="/listings/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 text-[var(--color-brand-light)] text-sm font-medium hover:bg-[var(--color-brand)]/30 transition-all"
            >
              + Publicar carta
            </Link>

            {/* Dropdown de perfil */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(o => !o)}
                className="flex items-center gap-1.5 focus:outline-none"
                aria-label="Menu de usuario"
              >
                <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
                <span className="hidden sm:block text-xs text-[var(--color-muted)] hover:text-white transition-colors">
                  ▾
                </span>
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1 z-50"
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to="/profile/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    ⚙️ Editar perfil
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    📦 Mis Pedidos
                  </Link>

                  {/* Link al Admin Panel - solo visible para admins */}
                  {isAdmin && (
                    <>
                      <div className="mx-3 my-1 border-t border-[var(--color-border)]" />
                      <Link
                        to="/admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-brand-light)] hover:text-white hover:bg-[var(--color-brand)]/20 transition-colors rounded-b-xl"
                      >
                        🛡️ Admin Panel
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-[var(--color-brand)] transition-all">
                Iniciar sesión
              </button>
            </SignInButton>
          </SignedOut>

          {/* Hamburguesa mobile */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${ mobileOpen ? 'rotate-45 translate-y-2' : '' }`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${ mobileOpen ? 'opacity-0' : '' }`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${ mobileOpen ? '-rotate-45 -translate-y-2' : '' }`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 space-y-1">
          <NavLink to="/marketplace" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Marketplace</NavLink>
          <NavLink to="/store" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Tienda</NavLink>
          <SignedIn>
            <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
            <NavLink to="/orders" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Mis Pedidos</NavLink>
            <NavLink to="/listings/new" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>+ Publicar carta</NavLink>
            <NavLink to="/profile/settings" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>⚙️ Editar perfil</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>🛡️ Admin Panel</NavLink>
            )}
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full text-left px-4 py-3 rounded-xl text-sm text-[var(--color-muted)] hover:text-white transition-colors">
                Iniciar sesión
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </header>
  )
}
