import { LogOut, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { navigationItems } from '../../config/navigation'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getCurrentUser, signOut } from '../../utils/auth'
import { getBrandingEventName, getCompanyLogo } from '../../utils/branding'

type SidebarProps = {
  onNavigate?: () => void
  onClose?: () => void
  mobile?: boolean
}

export default function Sidebar({ onNavigate, onClose, mobile = false }: SidebarProps) {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const title = user?.businessName || 'Agenda Pro'
  const subtitle = user?.specialty || 'Agenda profissional'
  const initial = title.charAt(0).toUpperCase()
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
    onNavigate?.()
    onClose?.()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="sidebar-branding-wrap">
          <div className="sidebar-brand-mark">
            {logoUrl ? (
              <img src={logoUrl} alt={title} className="brand-logo brand-logo--sidebar" />
            ) : (
              <span>{initial || 'A'}</span>
            )}
          </div>

          <div>
            <p>Agenda Pro</p>
            <h2>{title}</h2>
            <small>{subtitle}</small>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            className="icon-button only-mobile"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`.trim()}
            >
              <span className="sidebar-link-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-link logout-button" onClick={handleLogout}>
          <span className="sidebar-link-icon">
            <LogOut size={18} />
          </span>
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}