import { Link } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUser } from '../utils/auth'

export default function ClientHomePage() {
  const user = getCurrentUser()

  return (
    <div className="page-stack">
      <SectionHeader
        title="Portal do cliente"
        description="Agende seus horários e acompanhe seus próximos atendimentos."
        action={<Link to={ROUTE_PATHS.clientBook} className="primary-button">Agendar horário</Link>}
      />

      <div className="cards-grid two-cols">
        <PageCard>
          <h3>Bem-vindo, {user?.fullName || 'cliente'}!</h3>
          <p className="muted-text top-gap">Use o portal para escolher serviços, consultar horários livres e acompanhar seus agendamentos.</p>
        </PageCard>

        <PageCard>
          <h3>Ações rápidas</h3>
          <div className="top-gap page-stack">
            <Link to={ROUTE_PATHS.clientBook} className="primary-button">Novo agendamento</Link>
            <Link to={ROUTE_PATHS.clientAppointments} className="secondary-button">Meus agendamentos</Link>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
