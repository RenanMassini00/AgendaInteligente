import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import MobileTabBar from './MobileTabBar'
import Sidebar from './Sidebar'
import { getCurrentUser } from '../../utils/auth'
import {
  getCurrentNavigationItem,
  getMobileNavigationItems,
  getNavigationItemsForUser,
} from '../../utils/navigation'

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const user = getCurrentUser()
  const role = user?.role

  const navigationItems = useMemo(() => {
    return getNavigationItemsForUser(user)
  }, [user?.hasAppointmentsModule, user?.hasCatalogModule, user?.role])

  const mobileNavigationItems = useMemo(() => {
    return getMobileNavigationItems(navigationItems, user)
  }, [navigationItems, user?.role])

  const currentItem = getCurrentNavigationItem(navigationItems, location.pathname)

  const title =
    currentItem?.label ??
    (role === 'master_admin' ? 'Painel Administrativo' : 'Painel')

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

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

      <MobileTabBar
        items={mobileNavigationItems}
        onOpenMenu={() => setIsSidebarOpen(true)}
      />
    </div>
  )
}
