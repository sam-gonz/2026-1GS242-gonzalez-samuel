import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '../lib/api'

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function ListingsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', search, status, page],
    queryFn: () => adminApi.listings({ page, search: search || undefined, status: status || undefined }),
  })

  const deleteListing = useMutation({
    mutationFn: (id: string) => adminApi.deleteListing(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-listings'] }); setConfirmDelete(null) },
  })

  const pages = Math.max(Math.ceil((data?.total ?? 1) / 20), 1)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Publicaciones</h1>
        <p className="text-[#6b6b80] text-sm mt-1">{data?.total ?? 0} publicaciones en total</p>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-[#18181f] border border-[#2e2e3a] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:border-[#7c3aed] transition-colors"
          placeholder="Buscar por carta o vendedor..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="px-3 py-2 rounded-xl bg-[#18181f] border border-[#2e2e3a] text-sm text-[#6b6b80] focus:outline-none focus:border-[#7c3aed] transition-colors"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="sold">Vendida</option>
          <option value="cancelled">Cancelada</option>
          <option value="in_transaction">En transacción</option>
        </select>
      </div>

      {isLoading
        ? <div className="flex items-center gap-2 text-[#6b6b80] py-8"><div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" /> Cargando...</div>
        : (
          <div className="space-y-2">
            {(data?.listings ?? []).map((l: any) => (
              <div key={l._id} className="flex items-start justify-between p-4 rounded-xl bg-[#18181f] border border-[#2e2e3a] gap-3 flex-wrap hover:border-[#7c3aed]/40 transition-colors">
                <div className="flex gap-3">
                  {l.catalogCard?.imageUrl && (
                    <img src={l.catalogCard.imageUrl} alt={l.catalogCard.name}
                      className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{l.catalogCard?.name ?? 'Sin nombre'}</p>
                    <p className="text-xs text-[#6b6b80]">
                      {l.catalogCard?.game} · {l.catalogCard?.rarity} · {l.condition}
                    </p>
                    <p className="text-xs text-[#6b6b80]">
                      Vendedor: <span className="text-white">{l.seller?.username}</span> ·
                      Precio: <span className="text-white">{l.askingPrice ? fmt(l.askingPrice) : 'Intercambio'}</span> ·
                      Vistas: <span className="text-white">{l.views ?? 0}</span>
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                      l.status === 'active' ? 'bg-green-600/20 border-green-600/40 text-green-400'
                      : l.status === 'sold' ? 'bg-[#7c3aed]/20 border-[#7c3aed]/40 text-[#a78bfa]'
                      : 'bg-[#23232d] border-[#2e2e3a] text-[#6b6b80]'
                    }`}>{l.status}</span>
                  </div>
                </div>
                {l.status === 'active' && (
                  confirmDelete === l._id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">¿Confirmar?</span>
                      <button onClick={() => deleteListing.mutate(l._id)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-red-600/30 border border-red-600/50 text-red-400 hover:bg-red-600/50 transition-colors">
                        {deleteListing.isPending ? '...' : 'Sí'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-[#23232d] border border-[#2e2e3a] text-[#6b6b80] hover:text-white transition-colors">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(l._id)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-red-600/20 border border-red-600/40 text-red-400 hover:bg-red-600/30 transition-colors">
                      🗑️ Eliminar
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )
      }

      <div className="flex justify-center items-center gap-3 mt-6">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
          className="px-4 py-2 text-sm rounded-lg border border-[#2e2e3a] text-[#6b6b80] disabled:opacity-40 hover:text-white transition-colors">
          ←
        </button>
        <span className="text-[#6b6b80] text-sm">Página {page} de {pages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page >= pages}
          className="px-4 py-2 text-sm rounded-lg border border-[#2e2e3a] text-[#6b6b80] disabled:opacity-40 hover:text-white transition-colors">
          →
        </button>
      </div>
    </div>
  )
}
