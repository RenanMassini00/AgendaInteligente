import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../utils/auth'
import { getBrandingEventName, getCompanyLogo } from '../../utils/branding'

type HeaderProps = {
  title: string
  onOpenSidebar: () => void
}

export default function Header({ title, onOpenSidebar }: HeaderProps) {
  const user = getCurrentUser()
  const displayName = user?.businessName || user?.fullName || 'Scheduler'
  const subtitle = user?.specialty || (user?.role === 'client' ? 'Cliente' : 'Agenda profissional')
  const initial = displayName.charAt(0).toUpperCase()
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

  return (
    <header className="app-header">
      <div className="header-left">
        <button type="button" className="icon-button only-mobile" onClick={onOpenSidebar} aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <div>
          <span className="header-caption">Bem-vindo de volta</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="header-profile">
        <div>
          <strong>{displayName}</strong>
          <span>{subtitle}</span>
        </div>

        {logoUrl ? (
          <img src={logoUrl} alt={displayName} className="brand-logo" />
        ) : (
          <div className="avatar">{initial || 'S'}</div>
        )}
      </div>
    </header>
  )
}
