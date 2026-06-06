import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'
import { filterVisibleAppointments } from '../utils/appointments'
import type { Appointment } from '../types/appointment.types'

function getAppointmentTime(appointment: Appointment) {
  if (appointment.startTime && appointment.endTime) {
    return `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`
  }

  return appointment.time?.slice(0, 5) || '--:--'
}

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAppointments() {
      try {
        setIsLoading(true)
        const data = await api.get<Appointment[]>(`/api/client/appointments?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setAppointments(filterVisibleAppointments(data))
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar seus agendamentos.')
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

  if (isLoading) return <div className="feedback-card">Carregando seus agendamentos...</div>
  if (errorMessage) return <div className="feedback-card error-box">{errorMessage}</div>

  return (
    <div className="page-stack client-appointments-page">
      <SectionHeader title="Meus agendamentos" description="Acompanhe seus horarios marcados." />

      <PageCard className="client-appointments-card appointment-cards-panel">
        <div className="appointment-cards-grid client">
          {appointments.length === 0 ? (
            <div className="feedback-card full-width">Nenhum agendamento encontrado.</div>
          ) : (
            appointments.map((appointment) => (
              <article key={appointment.id} className="appointment-summary-card client">
                <div className="appointment-summary-top">
                  <span className="appointment-summary-time">
                    {getAppointmentTime(appointment)}
                  </span>
                  <StatusBadge status={appointment.status} />
                </div>

                <div className="appointment-summary-main">
                  <h3>{appointment.serviceName}</h3>
                  <p>{appointment.date}</p>
                </div>

                <div className="appointment-summary-meta single-line">
                  <span>
                    <small>Valor</small>
                    <strong>{appointment.priceFormatted}</strong>
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </PageCard>
    </div>
  )
}
