import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { CardBackground } from './CardBackground'

export function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* Fondo animado de cartas — z-0, pointer-events-none, no altera diseño */}
      <CardBackground />

      {/* Todo el contenido encima del fondo */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-[var(--color-border)] py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center text-[var(--color-muted)] text-sm">
            <p>© 2026 TradeUp TCG · El marketplace de cartas coleccionables</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
