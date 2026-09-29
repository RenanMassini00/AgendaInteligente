import { useNavigate, useParams } from 'react-router-dom'
import AppointmentForm from '../components/appointments/AppointmentForm'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'

export default function CreateAppointmentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const appointmentId = id ? Number(id) : undefined

  return (
    <div className="page-stack appointment-editor-page">
      <SectionHeader
        title={appointmentId ? 'Editar agendamento' : 'Novo agendamento'}
        description={
          appointmentId
            ? 'Atualize cliente, serviço e horário do compromisso.'
            : 'Crie um novo compromisso integrado diretamente com a API.'
        }
      />

      <PageCard className="appointment-editor-card">
        <AppointmentForm
          appointmentId={appointmentId}
          onSubmitSuccess={() => navigate(ROUTE_PATHS.appointments)}
        />
      </PageCard>
    </div>
  )
}
