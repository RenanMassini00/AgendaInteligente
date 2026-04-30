import { useNavigate } from 'react-router-dom'
import AppointmentForm from '../components/appointments/AppointmentForm'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'

export default function CreateAppointmentPage() {
  const navigate = useNavigate()

  return (
    <div className="page-stack">
      <SectionHeader
        title="Novo agendamento"
        description="Crie um novo compromisso integrado diretamente com a API."
      />

      <PageCard>
        <AppointmentForm onSubmitSuccess={() => navigate(ROUTE_PATHS.appointments)} />
      </PageCard>
    </div>
  )
}
