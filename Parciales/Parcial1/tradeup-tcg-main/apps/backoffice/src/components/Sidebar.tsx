import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/users', label: 'Usuarios', icon: '👥' },
  { to: '/listings', label: 'Publicaciones', icon: '🃏' },
  { to: '/orders', label: 'Pedidos', icon: '📦' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-[#18181f] border-r border-[#2e2e3a] flex flex-col z-20">
      <div className="px-6 py-5 border-b border-[#2e2e3a]">
        <span className="text-lg font-bold">
          <span className="text-[#a78bfa]">🃏 TradeUp</span>
          <span className="text-[#6b6b80] text-xs ml-1">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#7c3aed]/20 text-white border border-[#7c3aed]/30'
                  : 'text-[#6b6b80] hover:text-white hover:bg-[#23232d]'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-[#2e2e3a]">
        <p className="text-xs text-[#6b6b80]">© 2026 TradeUp TCG</p>
      </div>
    </aside>
  )
}
