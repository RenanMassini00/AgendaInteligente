import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../../utils/navigation'

type MobileTabBarProps = {
  items: NavigationItem[]
  onOpenMenu: () => void
}

export default function MobileTabBar({ items, onOpenMenu }: MobileTabBarProps) {
  if (!items.length) return null

  return (
    <nav className="mobile-tab-bar" aria-label="Acesso rápido">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mobile-tab-link ${isActive ? 'active' : ''}`.trim()
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span className="mobile-tab-label">{item.label}</span>
          </NavLink>
        )
      })}

      <button
        type="button"
        className="mobile-tab-link mobile-tab-menu"
        onClick={onOpenMenu}
        aria-label="Abrir menu completo"
      >
        <Menu size={20} aria-hidden="true" />
        <span className="mobile-tab-label">Mais</span>
      </button>
    </nav>
  )
}
