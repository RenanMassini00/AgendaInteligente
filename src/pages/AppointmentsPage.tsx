import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import WeeklyAgenda from '../components/appointments/WeeklyAgenda'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import { filterVisibleAppointments, isCancelledAppointmentStatus } from '../utils/appointments'
import type { Appointment } from '../types/appointment.types'

function normalizeStatusLabel(status: string) {
  return (status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function canComplete(status: string) {
  const normalized = normalizeStatusLabel(status)
  return !['completed', 'concluded', 'done', 'concluido'].includes(normalized) &&
    !isCancelledAppointmentStatus(status)
}

function canDelete(status: string) {
  const normalized = normalizeStatusLabel(status)
  return !['completed', 'concluded', 'done', 'concluido'].includes(normalized)
}

function getAppointmentTime(appointment: Appointment) {
  if (appointment.startTime && appointment.endTime) {
    return `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`
  }

  return appointment.time?.slice(0, 5) || '--:--'
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

      setAppointments(filterVisibleAppointments(response))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar os agendamentos.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditAppointment(id: number) {
    navigate(`/appointments/${id}/edit`)
  }

  async function handleCompleteAppointment(id: number) {
    const confirmed = window.confirm('Deseja marcar este agendamento como concluido?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.patch(`/api/appointments/${id}/status`, {
        status: 'completed',
      } as never)

      setSuccessMessage('Agendamento concluido com sucesso.')
      await loadAppointments()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel concluir o agendamento.'
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

      setSuccessMessage('Agendamento excluido com sucesso.')
      await loadAppointments()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel excluir o agendamento.'
      )
    }
  }

  return (
    <div className="page-stack appointments-management-page">
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

      <WeeklyAgenda appointments={appointments} isLoading={isLoading} />

      <PageCard className="appointments-list-card appointment-cards-panel">
        <div className="appointments-list-header">
          <div>
            <h3>Todos os agendamentos</h3>
            <p>Cards compactos para conferencia, edicao e conclusao.</p>
          </div>
        </div>

        <div className="appointment-cards-grid">
          {isLoading ? (
            <div className="feedback-card full-width">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <div className="feedback-card full-width">Nenhum agendamento encontrado.</div>
          ) : (
            appointments.map((appointment) => (
              <article key={appointment.id} className="appointment-summary-card professional">
                <div className="appointment-summary-top">
                  <span className="appointment-summary-time">
                    {getAppointmentTime(appointment)}
                  </span>
                  <StatusBadge status={appointment.status} />
                </div>

                <div className="appointment-summary-main">
                  <h3>{appointment.clientName}</h3>
                  <p>{appointment.serviceName}</p>
                </div>

                <div className="appointment-summary-meta">
                  <span>
                    <small>Data</small>
                    <strong>{appointment.date}</strong>
                  </span>
                  <span>
                    <small>Valor</small>
                    <strong>{appointment.priceFormatted}</strong>
                  </span>
                </div>

                <div className="appointment-summary-actions">
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
              </article>
            ))
          )}
        </div>
      </PageCard>
    </div>
  )
}
