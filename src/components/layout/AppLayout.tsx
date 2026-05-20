import { type ReactNode, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { adminNavigationItems, professionalNavigationItems } from '../../config/navigation'
import { getCurrentRole } from '../../utils/auth'

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const role = getCurrentRole()

  const navigationItems = useMemo(() => {
    return role === 'master_admin' ? adminNavigationItems : professionalNavigationItems
  }, [role])

  const currentItem = navigationItems.find((item) => {
    if (location.pathname === item.path) return true
    return location.pathname.startsWith(item.path)
  })

  const title =
    currentItem?.label ??
    (role === 'master_admin' ? 'Painel Administrativo' : 'Painel')

  return (
    <div className={`app-shell ${role === 'master_admin' ? 'app-shell--admin' : 'app-shell--professional'}`}>
      <aside className="app-sidebar desktop-only">
        <Sidebar />
      </aside>

      <div className="app-main">
        <Header title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="app-content">
          <div className="app-content-inner">{children}</div>
        </main>
      </div>

      {isSidebarOpen ? (
        <div className="mobile-sidebar-wrapper">
          <div
            className="mobile-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="mobile-sidebar-panel">
            <Sidebar
              mobile
              onClose={() => setIsSidebarOpen(false)}
              onNavigate={() => setIsSidebarOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </div>
  )
}
