import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '../lib/api'

const SHIPPING_OPTIONS = ['pending', 'preparing', 'shipped', 'delivered']

function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green: 'bg-green-600/20 border-green-600/40 text-green-400',
    red: 'bg-red-600/20 border-red-600/40 text-red-400',
    yellow: 'bg-yellow-600/20 border-yellow-600/40 text-yellow-400',
    purple: 'bg-[#7c3aed]/20 border-[#7c3aed]/40 text-[#a78bfa]',
    gray: 'bg-[#23232d] border-[#2e2e3a] text-[#6b6b80]',
  }
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${map[color] ?? map.gray}`}>{label}</span>
}

export function UsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.users({ page, search: search || undefined, role: role || undefined }),
  })

  const banUser = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => adminApi.banUser(id, banned),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const setUserRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.setRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const pages = Math.max(Math.ceil((data?.total ?? 1) / 20), 1)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
        <p className="text-[#6b6b80] text-sm mt-1">{data?.total ?? 0} usuarios registrados</p>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-[#18181f] border border-[#2e2e3a] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:border-[#7c3aed] transition-colors"
          placeholder="Buscar por nombre o email..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="px-3 py-2 rounded-xl bg-[#18181f] border border-[#2e2e3a] text-sm text-[#6b6b80] focus:outline-none focus:border-[#7c3aed] transition-colors"
          value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
        >
          <option value="">Todos los roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading
        ? <div className="flex items-center gap-2 text-[#6b6b80] py-8"><div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" /> Cargando...</div>
        : (
          <div className="space-y-2">
            {(data?.users ?? []).map((u: any) => (
              <div key={u._id} className="flex items-start justify-between p-4 rounded-xl bg-[#18181f] border border-[#2e2e3a] gap-3 flex-wrap hover:border-[#7c3aed]/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{u.username}</span>
                    <Badge label={u.role} color={u.role === 'admin' ? 'purple' : u.role === 'seller' ? 'yellow' : 'gray'} />
                    {u.isBanned && <Badge label="Baneado" color="red" />}
                  </div>
                  <p className="text-xs text-[#6b6b80]">{u.email}</p>
                  <p className="text-xs text-[#6b6b80]">
                    Rep: <span className="text-white">{u.reputation ?? 0}</span> ·
                    Reviews: <span className="text-white">{u.reviewCount ?? 0}</span> ·
                    Desde: <span className="text-white">{new Date(u.createdAt).toLocaleDateString('es')}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    className="px-2 py-1 text-xs rounded-lg bg-[#23232d] border border-[#2e2e3a] text-white focus:outline-none"
                    value={u.role}
                    onChange={e => setUserRole.mutate({ id: u._id, role: e.target.value })}
                  >
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
                    }`}
                  >
                    {u.isBanned ? '✅ Desbanear' : '🚫 Banear'}
                  </button>
                </div>
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
