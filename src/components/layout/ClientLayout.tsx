import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, Home, LogOut } from 'lucide-react'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getCurrentUser, signOut } from '../../utils/auth'
import { getBrandingEventName, getCompanyLogo } from '../../utils/branding'

type ClientLayoutProps = {
  children: ReactNode
}

const navigation = [
  { label: 'Início', path: ROUTE_PATHS.clientHome, icon: Home },
  { label: 'Agendar', path: ROUTE_PATHS.clientBook, icon: CalendarDays },
  { label: 'Meus horários', path: ROUTE_PATHS.clientAppointments, icon: CalendarDays },
]

export default function ClientLayout({ children }: ClientLayoutProps) {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [logoUrl, setLogoUrl] = useState(getCompanyLogo())

  useEffect(() => {
    function syncBranding() {
      setLogoUrl(getCompanyLogo())
    }

    window.addEventListener(getBrandingEventName(), syncBranding)
    window.addEventListener('storage', syncBranding)

    return () => {
      window.removeEventListener(getBrandingEventName(), syncBranding)
      window.removeEventListener('storage', syncBranding)
    }
  }, [])

  function handleLogout() {
    signOut()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar desktop-sidebar client-sidebar-visible">
        <div className="sidebar-shell">
          <div className="sidebar-brand">
            <div className="sidebar-branding-wrap">
              {logoUrl ? (
                <div className="sidebar-brand-mark">
                  <img
                    src={logoUrl}
                    alt="Logo do profissional"
                    className="brand-logo brand-logo--sidebar"
                  />
                </div>
              ) : null}

              <div>
                <p>Portal do cliente</p>
                <h2>{user?.fullName || 'Cliente'}</h2>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`.trim()}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="sidebar-footer">
            <button type="button" className="sidebar-link logout-button" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="content-shell">
        <header className="app-header">
          <div className="header-left">
            <div>
              <span className="header-caption">Portal do cliente</span>
              <h1>Minha agenda</h1>
            </div>
          </div>

          <div className="header-profile">
            <div>
              <strong>{user?.fullName || 'Cliente'}</strong>
              <span>{user?.email || 'Conta do cliente'}</span>
            </div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo do profissional" className="brand-logo" />
            ) : (
              <div className="avatar light">{(user?.fullName || 'C').charAt(0).toUpperCase()}</div>
            )}
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
