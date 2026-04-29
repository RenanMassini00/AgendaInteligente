import { Link, useNavigate } from 'react-router-dom'
import AppointmentForm from '../components/appointments/AppointmentForm'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import type { Appointment } from '../types/appointment.types'

type AppointmentFormSubmit = Appointment & {
  notes?: string
}

export default function CreateAppointmentPage() {
  const navigate = useNavigate()

  function handleCreateAppointment(data: AppointmentFormSubmit) {
    console.log('Novo agendamento:', data)
    navigate(ROUTE_PATHS.appointments)
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Novo agendamento"
        description="Preencha os dados para criar um novo compromisso."
        action={
          <Link to={ROUTE_PATHS.appointments} className="secondary-button">
            Voltar
          </Link>
        }
      />

      <PageCard>
        <AppointmentForm onSubmit={handleCreateAppointment} />
      </PageCard>
    </div>
  )
}