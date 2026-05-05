const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function authRequest(url: string, options: RequestInit = {}) {
  const { Clerk } = window as any
  const token = await Clerk?.session?.getToken()
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${BASE}${url}`, { ...options, headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as any).error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const adminApi = {
  metrics: () => authRequest('/api/admin/metrics'),
  users: (params?: { page?: number; search?: string; role?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : ''
    return authRequest(`/api/admin/users${qs}`)
  },
  banUser: (id: string, banned: boolean) =>
    authRequest(`/api/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ banned }) }),
  setRole: (id: string, role: string) =>
    authRequest(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  listings: (params?: { page?: number; status?: string; search?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : ''
    return authRequest(`/api/admin/listings${qs}`)
  },
  deleteListing: (id: string) => authRequest(`/api/admin/listings/${id}`, { method: 'DELETE' }),
  transactions: (params?: { page?: number; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : ''
    return authRequest(`/api/admin/transactions${qs}`)
  },
  updateShipping: (id: string, shippingStatus: string) =>
    authRequest(`/api/admin/transactions/${id}/shipping`, { method: 'PATCH', body: JSON.stringify({ shippingStatus }) }),
}
