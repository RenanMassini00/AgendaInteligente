import { LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'

type SidebarProps = {
  onNavigate?: () => void
  onClose?: () => void
  mobile?: boolean
}

export default function Sidebar({ onNavigate, onClose, mobile = false }: SidebarProps) {
  return (
    <div className="sidebar-shell">
      <div className="sidebar-brand">
        <div>
          <p>Agenda Pro</p>
          <h2>Scheduler</h2>
        </div>
        {mobile && (
          <button type="button" className="icon-button only-mobile" onClick={onClose} aria-label="Fechar menu">
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
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-link logout-button">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}
