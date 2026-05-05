import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../lib/api'
import { useState } from 'react'

const SHIPPING_OPTIONS = ['pending', 'preparing', 'shipped', 'delivered']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green: 'bg-green-600/20 border-green-600/40 text-green-400',
    red: 'bg-red-600/20 border-red-600/40 text-red-400',
    yellow: 'bg-yellow-600/20 border-yellow-600/40 text-yellow-400',
    purple: 'bg-[var(--color-brand)]/20 border-[var(--color-brand)]/40 text-[var(--color-brand-light)]',
    gray: 'bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-muted)]',
  }
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${map[color] ?? map.gray}`}>
      {label}
    </span>
  )
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border flex flex-col gap-2 ${
      accent
        ? 'bg-[var(--color-brand)]/10 border-[var(--color-brand)]/40'
        : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
    }`}>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      <p className="text-xs text-[var(--color-muted)] font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-[var(--color-muted)]">{sub}</p>}
    </div>
  )
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.max(Math.ceil(total / perPage), 1)
  return (
    <div className="flex justify-center items-center gap-3 mt-4">
      <button onClick={() => onChange(Math.max(page - 1, 1))} disabled={page === 1}
        className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] disabled:opacity-40 hover:text-white transition-colors">
        ←
      </button>
      <span className="text-[var(--color-muted)] text-sm">Página {page} de {pages}</span>
      <button onClick={() => onChange(Math.min(page + 1, pages))} disabled={page >= pages}
        className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] disabled:opacity-40 hover:text-white transition-colors">
        →
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminPage() {
  const apiFn = useApi()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'metrics' | 'users' | 'listings' | 'orders'>('metrics')

  // --- Users state ---
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [userPage, setUserPage] = useState(1)

  // --- Listings state ---
  const [listingSearch, setListingSearch] = useState('')
  const [listingStatus, setListingStatus] = useState('')
  const [listingPage, setListingPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // --- Orders state ---
  const [orderStatus, setOrderStatus] = useState('')
  const [orderPage, setOrderPage] = useState(1)

  // ─── Queries ───────────────────────────────────────────────────────────────
  const metrics = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => apiFn.admin.metrics(),
    enabled: tab === 'metrics',
    refetchInterval: 60_000,
  })

  const users = useQuery({
    queryKey: ['admin-users', userSearch, roleFilter, userPage],
    queryFn: () => apiFn.admin.users({ page: userPage, search: userSearch || undefined, role: roleFilter || undefined }),
    enabled: tab === 'users',
  })

  const listings = useQuery({
    queryKey: ['admin-listings', listingSearch, listingStatus, listingPage],
    queryFn: () => apiFn.admin.listings({ page: listingPage, search: listingSearch || undefined, status: listingStatus || undefined }),
    enabled: tab === 'listings',
  })

  const orders = useQuery({
    queryKey: ['admin-orders', orderStatus, orderPage],
    queryFn: () => apiFn.admin.transactions({ page: orderPage, status: orderStatus || undefined }),
    enabled: tab === 'orders',
  })

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const banUser = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => apiFn.admin.banUser(id, banned),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiFn.admin.setRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const updateShipping = useMutation({
    mutationFn: ({ id, shippingStatus }: { id: string; shippingStatus: string }) =>
      apiFn.admin.updateShipping(id, shippingStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  const deleteListing = useMutation({
    mutationFn: (id: string) => apiFn.admin.deleteListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-listings'] })
      setDeleteConfirm(null)
    },
  })

  const m = metrics.data

  const TABS = [
    { key: 'metrics', label: 'Métricas' },
    { key: 'users', label: 'Usuarios' },
    { key: 'listings', label: 'Publicaciones' },
    { key: 'orders', label: 'Pedidos' },
  ] as const

  const inputClass = 'px-4 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors'
  const selectClass = 'px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors'
  const rowClass = 'flex items-start justify-between p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] gap-3 flex-wrap hover:border-[var(--color-brand)]/40 transition-colors'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">🛡️ Admin Panel</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">Gestión completa del marketplace TradeUp</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-1 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[var(--color-brand)] text-white'
                : 'border-transparent text-[var(--color-muted)] hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MÉTRICAS ─────────────────────────────────────────────────── */}
      {tab === 'metrics' && (
        metrics.isLoading
          ? <div className="flex items-center gap-2 text-[var(--color-muted)] py-8"><div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />Cargando métricas...</div>
          : (
            <div className="space-y-6">
              {/* Revenue Stripe */}
              <div>
                <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">💰 Revenue (Stripe / Comisiones)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard accent label="Comisión total acumulada" value={fmt(m?.revenue?.commission?.total ?? 0)} />
                  <MetricCard accent label="Comisión este mes" value={fmt(m?.revenue?.commission?.thisMonth ?? 0)} sub={`Mes anterior: ${fmt(m?.revenue?.commission?.lastMonth ?? 0)}`} />
                  <MetricCard label="Volumen bruto total" value={fmt(m?.revenue?.gross?.total ?? 0)} sub="Suma de todas las transacciones" />
                  <MetricCard label="Volumen bruto este mes" value={fmt(m?.revenue?.gross?.thisMonth ?? 0)} />
                </div>
              </div>

              {/* Transacciones */}
              <div>
                <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">📦 Transacciones</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard label="Completadas total" value={(m?.transactions?.total ?? 0).toLocaleString()} />
                  <MetricCard label="Completadas este mes" value={(m?.transactions?.thisMonth ?? 0).toLocaleString()} />
                  <MetricCard label="Ofertas pendientes" value={(m?.pendingOffers ?? 0).toLocaleString()} />
                </div>
              </div>

              {/* Usuarios */}
              <div>
                <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">👥 Usuarios</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard label="Usuarios activos" value={(m?.activeUsers ?? 0).toLocaleString()} />
                  <MetricCard label="Nuevos este mes" value={(m?.newUsersMonth ?? 0).toLocaleString()} />
                  <MetricCard label="Usuarios baneados" value={(m?.bannedUsers ?? 0).toLocaleString()} />
                  <MetricCard label="Listings activos" value={(m?.activeListings ?? 0).toLocaleString()} />
                </div>
              </div>
            </div>
          )
      )}

      {/* ── TAB: USUARIOS ─────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input className={`flex-1 min-w-[200px] ${inputClass}`}
              placeholder="Buscar por nombre o email..."
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
            />
            <select className={selectClass} value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setUserPage(1) }}>
              <option value="">Todos los roles</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {users.isLoading
            ? <div className="flex items-center gap-2 text-[var(--color-muted)] py-4"><div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />Cargando...</div>
            : (
              <div className="space-y-2">
                {(users.data?.users ?? []).map((u: any) => (
                  <div key={u._id} className={rowClass}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{u.username}</span>
                        <Badge label={u.role} color={u.role === 'admin' ? 'purple' : u.role === 'seller' ? 'yellow' : 'gray'} />
                        {u.isBanned && <Badge label="Baneado" color="red" />}
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{u.email}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Reputación: <span className="text-white">{u.reputation ?? 0}</span> ·
                        Reviews: <span className="text-white">{u.reviewCount ?? 0}</span> ·
                        Registrado: <span className="text-white">{new Date(u.createdAt).toLocaleDateString('es')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select className="px-2 py-1 text-xs rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-white focus:outline-none"
                        value={u.role}
                        onChange={e => setRole.mutate({ id: u._id, role: e.target.value })}>
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        onClick={() => banUser.mutate({ id: u._id, banned: !u.isBanned })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          u.isBanned
                            ? 'bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/30'
                            : 'bg-red-600/20 border-red-600/40 text-red-400 hover:bg-red-600/30'
                        }`}>
                        {u.isBanned ? '✅ Desbanear' : '🚫 Banear'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
          <Pagination page={userPage} total={users.data?.total ?? 0} perPage={20} onChange={setUserPage} />
        </div>
      )}

      {/* ── TAB: PUBLICACIONES ────────────────────────────────────────────── */}
      {tab === 'listings' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input className={`flex-1 min-w-[200px] ${inputClass}`}
              placeholder="Buscar por carta o vendedor..."
              value={listingSearch}
              onChange={e => { setListingSearch(e.target.value); setListingPage(1) }}
            />
            <select className={selectClass} value={listingStatus}
              onChange={e => { setListingStatus(e.target.value); setListingPage(1) }}>
              <option value="">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="sold">Vendida</option>
              <option value="cancelled">Cancelada</option>
              <option value="in_transaction">En transacción</option>
            </select>
          </div>

          {listings.isLoading
            ? <div className="flex items-center gap-2 text-[var(--color-muted)] py-4"><div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />Cargando...</div>
            : (
              <div className="space-y-2">
                {(listings.data?.listings ?? []).map((l: any) => (
                  <div key={l._id} className={rowClass}>
                    <div className="flex gap-3">
                      {l.catalogCard?.imageUrl && (
                        <img src={l.catalogCard.imageUrl} alt={l.catalogCard.name} className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{l.catalogCard?.name ?? 'Sin nombre'}</span>
                          <Badge
                            label={l.status}
                            color={l.status === 'active' ? 'green' : l.status === 'sold' ? 'purple' : l.status === 'cancelled' ? 'red' : 'yellow'}
                          />
                        </div>
                        <p className="text-xs text-[var(--color-muted)]">
                          {l.catalogCard?.game} · {l.catalogCard?.rarity} · Condición: <span className="text-white">{l.condition}</span>
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          Vendedor: <span className="text-white">{l.seller?.username}</span> ·
                          Precio: <span className="text-white">{l.askingPrice ? fmt(l.askingPrice) : 'Solo intercambio'}</span> ·
                          Vistas: <span className="text-white">{l.views ?? 0}</span>
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          Publicado: {new Date(l.createdAt).toLocaleDateString('es')}
                        </p>
                      </div>
                    </div>

                    {l.status === 'active' && (
                      deleteConfirm === l._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400">¿Confirmar?</span>
                          <button onClick={() => deleteListing.mutate(l._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/30 border border-red-600/50 text-red-400 hover:bg-red-600/50 transition-colors">
                            {deleteListing.isPending ? '...' : 'Sí, eliminar'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white transition-colors">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(l._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 border border-red-600/40 text-red-400 hover:bg-red-600/30 transition-colors">
                          🗑️ Eliminar
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )
          }
          <Pagination page={listingPage} total={listings.data?.total ?? 0} perPage={20} onChange={setListingPage} />
        </div>
      )}

      {/* ── TAB: PEDIDOS ──────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select className={selectClass} value={orderStatus}
              onChange={e => { setOrderStatus(e.target.value); setOrderPage(1) }}>
              <option value="">Todos los estados</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {orders.isLoading
            ? <div className="flex items-center gap-2 text-[var(--color-muted)] py-4"><div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />Cargando...</div>
            : (
              <div className="space-y-2">
                {(orders.data?.transactions ?? []).map((tx: any) => (
                  <div key={tx._id} className={rowClass}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono text-[var(--color-muted)]">#...{tx._id.slice(-8)}</span>
                        <Badge
                          label={tx.status}
                          color={tx.status === 'completed' ? 'green' : tx.status === 'failed' ? 'red' : tx.status === 'refunded' ? 'yellow' : 'gray'}
                        />
                        <Badge label={tx.type ?? 'c2c'} color="gray" />
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">
                        Comprador: <span className="text-white">{tx.buyer?.username ?? '?'}</span> ·
                        Monto bruto: <span className="text-white">{fmt(tx.grossAmount ?? 0)}</span> ·
                        Comisión: <span className="text-[var(--color-brand-light)]">{fmt(tx.commissionAmount ?? 0)}</span>
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Envío: <span className="text-white">{tx.shippingStatus}</span> ·
                        Fecha: {new Date(tx.createdAt).toLocaleDateString('es')}
                      </p>
                    </div>
                    <select
                      className="px-2 py-1 text-xs rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-white focus:outline-none"
                      value={tx.shippingStatus}
                      onChange={e => updateShipping.mutate({ id: tx._id, shippingStatus: e.target.value })}>
                      {SHIPPING_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )
          }
          <Pagination page={orderPage} total={orders.data?.total ?? 0} perPage={20} onChange={setOrderPage} />
        </div>
      )}
    </div>
  )
}
