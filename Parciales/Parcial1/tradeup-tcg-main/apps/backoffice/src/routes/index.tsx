import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-start'

const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001'

interface Metrics {
  transactions: { total: number; thisMonth: number }
  revenue: {
    commission: { total: number; thisMonth: number; lastMonth: number }
    gross: { total: number; thisMonth: number }
  }
  activeUsers: number
  bannedUsers: number
  newUsersMonth: number
  pendingOffers: number
  activeListings: number
}

export const Route = createFileRoute('/')({ component: AdminDashboard })

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
      accent
        ? 'bg-[#7c3aed]/10 border-[#7c3aed]/40 hover:shadow-[0_0_0_1px_#7c3aed,0_8px_32px_-8px_rgba(124,58,237,0.4)]'
        : 'bg-[#18181f] border-[#2e2e3a] hover:shadow-[0_0_0_1px_#7c3aed,0_8px_32px_-8px_rgba(124,58,237,0.3)]'
    }`}>
      <p className="text-3xl font-bold text-[#e8e8f0]">{value}</p>
      <p className="text-xs text-[#6b6b80] font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-[#6b6b80]">{sub}</p>}
    </div>
  )
}

function AdminDashboard() {
  const { getToken } = useAuth()

  const { data, isLoading, isError } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch metrics')
      return res.json()
    },
    refetchInterval: 30_000,
  })

  return (
    <div className="min-h-screen bg-[#0f0f13] text-[#e8e8f0]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-56 bg-[#18181f] border-r border-[#2e2e3a] flex flex-col z-20">
        <div className="px-6 py-5 border-b border-[#2e2e3a]">
          <span className="text-lg font-bold text-[#a78bfa]">🃏 TradeUp</span>
          <span className="ml-1 text-xs text-[#6b6b80] align-top">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: 'Dashboard', href: '/', icon: '◈', active: true },
            { label: 'Usuarios', href: '/users', icon: '👥' },
            { label: 'Catálogo', href: '/catalog', icon: '🃏' },
            { label: 'Tienda', href: '/store', icon: '🏪' },
            { label: 'Transacciones', href: '/transactions', icon: '💳' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-[#7c3aed]/20 text-white border border-[#7c3aed]/30'
                  : 'text-[#6b6b80] hover:text-white hover:bg-[#23232d]'
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[#2e2e3a]">
          <p className="text-xs text-[#6b6b80]">© 2026 TradeUp TCG</p>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-[#6b6b80] text-sm mt-1">Métricas generales del marketplace</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 text-[#6b6b80] py-12">
            <div className="w-5 h-5 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            <span>Cargando métricas...</span>
          </div>
        )}

        {isError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            ⚠️ No se pudieron cargar las métricas. Verifica que la API esté corriendo en{' '}
            <code className="font-mono text-xs bg-red-900/30 px-1 rounded">{API_URL}</code>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">💰 Revenue (Stripe)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard accent label="Comisión total" value={fmt(data.revenue.commission.total)} />
                <StatCard accent label="Comisión este mes" value={fmt(data.revenue.commission.thisMonth)} sub={`Mes anterior: ${fmt(data.revenue.commission.lastMonth)}`} />
                <StatCard label="Volumen bruto total" value={fmt(data.revenue.gross.total)} />
                <StatCard label="Volumen bruto este mes" value={fmt(data.revenue.gross.thisMonth)} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">📦 Actividad</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Transacciones completadas" value={data.transactions.total.toLocaleString()} sub={`+${data.transactions.thisMonth} este mes`} />
                <StatCard label="Ofertas pendientes" value={data.pendingOffers.toLocaleString()} />
                <StatCard label="Listings activos" value={data.activeListings.toLocaleString()} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">👥 Usuarios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Activos" value={data.activeUsers.toLocaleString()} />
                <StatCard label="Nuevos este mes" value={data.newUsersMonth.toLocaleString()} />
                <StatCard label="Baneados" value={data.bannedUsers.toLocaleString()} />
              </div>
            </section>

            <section className="bg-[#18181f] border border-[#2e2e3a] rounded-xl p-5">
              <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">Acciones rápidas</h2>
              <div className="flex flex-wrap gap-3">
                <a href="/users" className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors">Gestionar usuarios</a>
                <a href="/transactions" className="px-4 py-2 rounded-lg bg-[#23232d] text-[#e8e8f0] text-sm border border-[#2e2e3a] hover:border-[#7c3aed] transition-colors">Ver transacciones</a>
                <a href="/catalog" className="px-4 py-2 rounded-lg bg-[#23232d] text-[#e8e8f0] text-sm border border-[#2e2e3a] hover:border-[#7c3aed] transition-colors">Catálogo de cartas</a>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
