import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Appointment } from '../types/appointment.types'

function canComplete(status: string) {
  const normalized = (status || '').toLowerCase()
  return !['completed', 'concluded', 'done', 'concluído', 'cancelled', 'canceled', 'cancelado'].includes(normalized)
}

function canDelete(status: string) {
  const normalized = (status || '').toLowerCase()
  return !['completed', 'concluded', 'done', 'concluído'].includes(normalized)
}

export default function AppointmentsPage() {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<Appointment[]>(
        `/api/appointments?userId=${getCurrentUserId()}`
      )

      setAppointments(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os agendamentos.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditAppointment(id: number) {
    navigate(`/appointments/${id}/edit`)
  }

  async function handleCompleteAppointment(id: number) {
    const confirmed = window.confirm('Deseja marcar este agendamento como concluído?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.patch(`/api/appointments/${id}/status`, {
        status: 'completed',
      } as never)

      setSuccessMessage('Agendamento concluído com sucesso.')
      await loadAppointments()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o agendamento.'
      )
    }
  }

  async function handleDeleteAppointment(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir este agendamento?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/appointments/${id}`)

      setSuccessMessage('Agendamento excluído com sucesso.')
      await loadAppointments()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o agendamento.'
      )
    }
  }

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
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

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
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-feedback">
                    Carregando agendamentos...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-feedback">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.clientName}</td>
                    <td>{appointment.serviceName}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td>{appointment.priceFormatted}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={() => handleEditAppointment(appointment.id)}
                        >
                          Editar
                        </button>

                        {canComplete(appointment.status) ? (
                          <button
                            type="button"
                            className="secondary-button small-button"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            Concluir
                          </button>
                        ) : null}

                        {canDelete(appointment.status) ? (
                          <button
                            type="button"
                            className="danger-button small-button"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            Excluir
                          </button>
                        ) : null}
                      </div>
                    </td>
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