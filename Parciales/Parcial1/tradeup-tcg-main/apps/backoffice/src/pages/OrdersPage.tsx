import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '../lib/api'

const SHIPPING_OPTIONS = ['pending', 'preparing', 'shipped', 'delivered']

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function OrdersPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => adminApi.transactions({ page, status: status || undefined }),
  })

  const updateShipping = useMutation({
    mutationFn: ({ id, shippingStatus }: { id: string; shippingStatus: string }) =>
      adminApi.updateShipping(id, shippingStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  const pages = Math.max(Math.ceil((data?.total ?? 1) / 20), 1)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="text-[#6b6b80] text-sm mt-1">{data?.total ?? 0} transacciones en total</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          className="px-3 py-2 rounded-xl bg-[#18181f] border border-[#2e2e3a] text-sm text-[#6b6b80] focus:outline-none focus:border-[#7c3aed] transition-colors"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {isLoading
        ? <div className="flex items-center gap-2 text-[#6b6b80] py-8"><div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" /> Cargando...</div>
        : (
          <div className="space-y-2">
            {(data?.transactions ?? []).map((tx: any) => (
              <div key={tx._id} className="flex items-start justify-between p-4 rounded-xl bg-[#18181f] border border-[#2e2e3a] gap-3 flex-wrap hover:border-[#7c3aed]/40 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-mono text-[#6b6b80]">#...{tx._id.slice(-8)}</p>
                  <p className="text-xs text-[#6b6b80]">
                    Comprador: <span className="text-white">{tx.buyer?.username ?? '?'}</span> ·
                    Bruto: <span className="text-white">{fmt(tx.grossAmount ?? 0)}</span> ·
                    Comisión: <span className="text-[#a78bfa]">{fmt(tx.commissionAmount ?? 0)}</span>
                  </p>
                  <p className="text-xs text-[#6b6b80]">
                    Pago: <span className={`font-medium ${
                      tx.status === 'completed' ? 'text-green-400'
                      : tx.status === 'failed' ? 'text-red-400'
                      : 'text-yellow-400'
                    }`}>{tx.status}</span> ·
                    Envío: <span className="text-white">{tx.shippingStatus}</span> ·
                    Fecha: {new Date(tx.createdAt).toLocaleDateString('es')}
                  </p>
                </div>
                <select
                  className="px-2 py-1 text-xs rounded-lg bg-[#23232d] border border-[#2e2e3a] text-white focus:outline-none"
                  value={tx.shippingStatus}
                  onChange={e => updateShipping.mutate({ id: tx._id, shippingStatus: e.target.value })}
                >
                  {SHIPPING_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
