import { Link } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import { ROUTE_PATHS } from '../routes/routePaths'

export default function NotFoundPage() {
  return (
    <div className="not-found-wrap">
      <PageCard className="not-found-card">
        <h2>Página não encontrada</h2>
        <p className="muted-text">A rota que você tentou acessar não existe no momento.</p>
        <Link to={ROUTE_PATHS.dashboard} className="primary-button inline-button">
          Voltar ao dashboard
        </Link>
      </PageCard>
    </div>
  )
}
