import { CalendarDays, Menu, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MASSINI_BRANDING } from '../../config/branding'
import { getCurrentUser } from '../../utils/auth'
import { getBrandingEventName, getCompanyLogo } from '../../utils/branding'

type HeaderProps = {
  title: string
  onOpenSidebar: () => void
}

function getGreeting(isAdmin: boolean) {
  if (isAdmin) return 'Central de comando'

  const hour = new Date().getHours()

  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getWorkspaceLabel(user: ReturnType<typeof getCurrentUser>, isAdmin: boolean) {
  if (isAdmin) return 'Gestão do ecossistema'

  if (user?.hasAppointmentsModule && user?.hasCatalogModule) {
    return 'Agenda + catálogo'
  }

  if (user?.hasCatalogModule) return 'Catálogo ativo'
  if (user?.hasAppointmentsModule) return 'Agenda ativa'

  return 'Painel profissional'
}

export default function Header({ title, onOpenSidebar }: HeaderProps) {
  const user = getCurrentUser()
  const isAdmin = user?.role === 'master_admin'

  const displayName = isAdmin
    ? MASSINI_BRANDING.name
    : user?.businessName || user?.fullName || 'Scheduler'

  const subtitle = isAdmin
    ? MASSINI_BRANDING.adminSubtitle
    : user?.specialty || 'Painel profissional'

  const initial = displayName.charAt(0).toUpperCase()
  const greeting = getGreeting(isAdmin)
  const workspaceLabel = getWorkspaceLabel(user, isAdmin)
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date())

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

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="icon-button only-mobile"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-block">
          <span className="header-caption">{greeting}</span>
          <h1>{title}</h1>

          <div className="header-insight-row" aria-label="Resumo do painel">
            <span className="header-insight-pill">
              <Sparkles size={15} />
              {workspaceLabel}
            </span>
            <span className="header-insight-pill header-insight-pill--muted">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-date-chip" aria-label="Data de hoje">
          <CalendarDays size={17} />
          <span>{todayLabel}</span>
        </div>

        <div className={`header-profile ${isAdmin ? 'header-profile--admin' : ''}`}>
          <div>
            <strong>{displayName}</strong>
            <span>{isAdmin ? 'Admin master' : user?.email || subtitle}</span>
          </div>

          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayName}
              className={`brand-logo ${isAdmin ? 'brand-logo--massini' : ''}`}
            />
          ) : (
            <div className="avatar">{initial || 'M'}</div>
          )}
        </div>
      </div>
    </header>
  )
}
