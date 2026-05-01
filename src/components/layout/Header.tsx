import { Menu } from 'lucide-react'
import { getBranding, getInitials } from '../../utils/branding'

type HeaderProps = {
  title: string
  onOpenSidebar: () => void
}

export default function Header({ title, onOpenSidebar }: HeaderProps) {
  const branding = getBranding()

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="header-left">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="icon-button only-mobile"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="header-kicker">Bem-vindo de volta</p>
            <h1 className="header-title">{title}</h1>
          </div>
        </div>

        <div className="profile-chip">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="profile-logo"
            />
          ) : (
            <div className="profile-avatar">
              {getInitials(branding.companyName)}
            </div>
          )}

          <div className="profile-text">
            <strong>{branding.companyName}</strong>
            <span>{branding.subtitle}</span>
          </div>
        </div>
      </div>
    </header>
  )
}