import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser, RedirectToSignIn } from '@clerk/clerk-react'
import { Sidebar } from './components/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { ListingsPage } from './pages/ListingsPage'
import { OrdersPage } from './pages/OrdersPage'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser()
  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!isSignedIn) return <RedirectToSignIn />
  if (user?.publicMetadata?.role !== 'admin') return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="text-center">
        <p className="text-3xl mb-4">🚫</p>
        <p className="text-white font-semibold">Acceso denegado</p>
        <p className="text-[#6b6b80] text-sm mt-1">Necesitas permisos de administrador</p>
        <a href="http://localhost:3000" className="mt-4 inline-block px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm">← Volver al sitio</a>
      </div>
    </div>
  )
  return <>{children}</>
}

export function App() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0f0f13] flex">
        <Sidebar />
        <main className="flex-1 ml-56 min-h-screen">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AdminGuard>
  )
}
