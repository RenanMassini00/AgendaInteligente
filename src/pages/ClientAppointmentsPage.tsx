import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'
import { filterVisibleAppointments } from '../utils/appointments'
import type { Appointment } from '../types/appointment.types'

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
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar seus agendamentos.')
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
    <div className="page-stack">
      <SectionHeader title="Meus agendamentos" description="Acompanhe seus horários marcados." />

      <PageCard className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
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
