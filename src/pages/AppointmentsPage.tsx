import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Appointment } from '../types/appointment.types'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAppointments() {
      try {
        setIsLoading(true)
        const response = await api.get<Appointment[]>(`/api/appointments?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setAppointments(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAppointments()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-stack">
      <SectionHeader
        title="Agendamentos"
        description="Visualize e gerencie os compromissos do profissional."
        action={
          <Link to={ROUTE_PATHS.createAppointment} className="primary-button">
            Novo
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <PageCard className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="table-feedback">Carregando agendamentos...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-feedback">Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.clientName}</td>
                    <td>{appointment.serviceName}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td><StatusBadge status={appointment.status} /></td>
                    <td>{appointment.priceFormatted}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  )
}
