import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { navigationItems } from '../../config/navigation'
import { ROUTE_PATHS } from '../../routes/routePaths'

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const currentPageLabel =
    location.pathname === ROUTE_PATHS.createAppointment
      ? 'Novo agendamento'
      : navigationItems.find((item) => item.path === location.pathname)?.label ?? 'Painel'

  return (
    <div className="app-shell">
      <aside className="sidebar desktop-sidebar">
        <Sidebar />
      </aside>

      {mobileOpen ? <button type="button" className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" /> : null}

      <aside className={`sidebar mobile-sidebar ${mobileOpen ? 'open' : ''}`.trim()}>
        <Sidebar mobile onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="content-shell">
        <Header title={currentPageLabel} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
