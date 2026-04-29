import { Menu } from 'lucide-react'

type HeaderProps = {
  title: string
  onOpenSidebar: () => void
}

export default function Header({ title, onOpenSidebar }: HeaderProps) {
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
          <strong>Renan Studio</strong>
          <span>Agenda profissional</span>
        </div>
        <div className="avatar">R</div>
      </div>
    </header>
  )
}
