import { LogOut, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { adminNavigationItems, professionalNavigationItems } from '../../config/navigation'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getCurrentUser, signOut } from '../../utils/auth'
import { getBrandingEventName, getCompanyLogo } from '../../utils/branding'
import { MASSINI_BRANDING } from '../../config/branding'

type SidebarProps = {
  onNavigate?: () => void
  onClose?: () => void
  mobile?: boolean
}

export default function Sidebar({ onNavigate, onClose, mobile = false }: SidebarProps) {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const role = user?.role
  const isAdmin = user?.role === 'master_admin'

  const navigationItems =
    user?.role === 'master_admin'
      ? adminNavigationItems
      : professionalNavigationItems.filter((item) => {
          if (item.key === 'catalog') {
            return user?.hasCatalogModule
          }

          if (
            ['appointments', 'clients', 'services', 'availability', 'finance'].includes(item.key)
          ) {
            return user?.hasAppointmentsModule
          }

          return true
        })

  const title =
    role === 'master_admin'
      ? MASSINI_BRANDING.name
      : user?.businessName || user?.fullName || 'Agenda Pro'

  const subtitle =
    role === 'master_admin'
      ? MASSINI_BRANDING.adminSubtitle
      : user?.specialty || 'Painel profissional'

  const caption = isAdmin ? MASSINI_BRANDING.name : 'Agenda Pro'
  const initial = title.charAt(0).toUpperCase()
  const moduleSummary = isAdmin
    ? 'Operação SaaS'
    : user?.hasAppointmentsModule && user?.hasCatalogModule
      ? 'Agenda e catálogo'
      : user?.hasCatalogModule
        ? 'Catálogo'
        : 'Agenda'
  const moduleDescription = isAdmin
    ? 'Empresas, usuários, cobrança e identidade visual.'
    : user?.hasAppointmentsModule && user?.hasCatalogModule
      ? 'Atendimentos, clientes, serviços e produtos no mesmo painel.'
      : user?.hasCatalogModule
        ? 'Produtos e vendas direcionadas em destaque.'
        : 'Agenda, clientes, serviços e disponibilidade.'
  const [logoUrl, setLogoUrl] = useState(
    isAdmin ? MASSINI_BRANDING.logo : getCompanyLogo()
  )

  useEffect(() => {
    if (isAdmin) {
      setLogoUrl(MASSINI_BRANDING.logo)
      return
    }

    function syncBranding() {
      setLogoUrl(getCompanyLogo())
    }

    window.addEventListener(getBrandingEventName(), syncBranding)
    window.addEventListener('storage', syncBranding)

    return () => {
      window.removeEventListener(getBrandingEventName(), syncBranding)
      window.removeEventListener('storage', syncBranding)
    }
  }, [isAdmin])

  function handleLogout() {
    signOut()
    onNavigate?.()
    onClose?.()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div className="sidebar-shell">
      <div className={`sidebar-brand ${isAdmin ? 'sidebar-brand--admin' : ''}`}>
        <div className="sidebar-branding-wrap">
          <div className="sidebar-brand-mark">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={title}
                className={`brand-logo brand-logo--sidebar ${isAdmin ? 'brand-logo--massini' : ''}`}
              />
            ) : (
              <span>{initial || 'M'}</span>
            )}
          </div>

          <div>
            <p>{caption}</p>
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

      <div className="sidebar-workspace-card">
        <span>{isAdmin ? 'Área administrativa' : 'Módulos ativos'}</span>
        <strong>{moduleSummary}</strong>
        <small>{moduleDescription}</small>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        <p className="sidebar-nav-label">Navegação</p>

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
        <div className="sidebar-session">
          <span>Conectado como</span>
          <strong>{isAdmin ? 'Admin master' : user?.fullName || title}</strong>
        </div>

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
