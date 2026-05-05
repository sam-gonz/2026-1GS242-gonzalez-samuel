import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { adminApi } from '../lib/api'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 transition-all hover:-translate-y-0.5 ${
      accent
        ? 'bg-[#7c3aed]/10 border-[#7c3aed]/40'
        : 'bg-[#18181f] border-[#2e2e3a] hover:border-[#7c3aed]/50'
    }`}>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#6b6b80] uppercase tracking-wide font-medium">{label}</p>
      {sub && <p className="text-xs text-[#6b6b80]">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { getToken } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/metrics`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      if (!res.ok) throw new Error('Error cargando métricas')
      return res.json()
    },
    refetchInterval: 30_000,
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#6b6b80] text-sm mt-1">Métricas generales del marketplace TradeUp</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 text-[#6b6b80] py-16">
          <div className="w-5 h-5 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          Cargando métricas...
        </div>
      )}

      {isError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          ⚠️ No se pudo conectar con la API en <code className="font-mono text-xs bg-red-900/30 px-1 rounded">{BASE}</code>.
          Asegúrate de que la API esté corriendo.
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-3">💰 Revenue (Stripe)</h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard accent label="Comisión total" value={fmt(data.revenue?.commission?.total ?? 0)} />
              <StatCard accent label="Comisión este mes" value={fmt(data.revenue?.commission?.thisMonth ?? 0)}
                sub={`Mes anterior: ${fmt(data.revenue?.commission?.lastMonth ?? 0)}`} />
              <StatCard label="Volumen bruto total" value={fmt(data.revenue?.gross?.total ?? 0)} />
              <StatCard label="Volumen bruto este mes" value={fmt(data.revenue?.gross?.thisMonth ?? 0)} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-3">📦 Actividad</h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Transacciones completadas" value={(data.transactions?.total ?? 0).toLocaleString()}
                sub={`+${data.transactions?.thisMonth ?? 0} este mes`} />
              <StatCard label="Ofertas pendientes" value={(data.pendingOffers ?? 0).toLocaleString()} />
              <StatCard label="Listings activos" value={(data.activeListings ?? 0).toLocaleString()} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-3">👥 Usuarios</h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Activos" value={(data.activeUsers ?? 0).toLocaleString()} />
              <StatCard label="Nuevos este mes" value={(data.newUsersMonth ?? 0).toLocaleString()} />
              <StatCard label="Baneados" value={(data.bannedUsers ?? 0).toLocaleString()} />
            </div>
          </section>

          <section className="bg-[#18181f] border border-[#2e2e3a] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-3">Acciones rápidas</h2>
            <div className="flex flex-wrap gap-3">
              <a href="/users" className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors">👥 Gestionar usuarios</a>
              <a href="/listings" className="px-4 py-2 rounded-lg bg-[#23232d] border border-[#2e2e3a] text-white text-sm hover:border-[#7c3aed] transition-colors">🃏 Publicaciones</a>
              <a href="/orders" className="px-4 py-2 rounded-lg bg-[#23232d] border border-[#2e2e3a] text-white text-sm hover:border-[#7c3aed] transition-colors">📦 Pedidos</a>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
