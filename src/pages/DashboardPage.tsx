import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import CatalogDashboard from '../components/appointments/CatalogDashboard'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUser, getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

type DashboardSummary = {
  appointmentsToday: number
  clients: number
  services: number
  expectedRevenue: number
  expectedRevenueFormatted: string
  upcomingAppointments: DashboardAppointment[]
  recentClients: DashboardClient[]
}

type DashboardAppointment = {
  id: number
  clientName: string
  serviceName: string
  date: string
  time: string
  startTime?: string
  endTime?: string
  status: AppointmentStatus
  priceFormatted: string
}

type DashboardClient = {
  id: number
  fullName?: string
  name?: string
  phone: string
}

type AppointmentApiItem = {
  id: number
  clientName?: string
  clientFullName?: string
  serviceName?: string
  appointmentDate?: string
  date?: string
  startTime?: string
  endTime?: string
  time?: string
  status?: string
  priceFormatted?: string
  priceAtBookingFormatted?: string
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function getWeekStart(date: Date) {
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + diff)
  current.setHours(0, 0, 0, 0)

  return current
}

function getCurrentWeekRange(date: Date) {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    startValue: toDateInputValue(start),
    endValue: toDateInputValue(end),
    label: `${formatDateLabel(toDateInputValue(start))} até ${formatDateLabel(toDateInputValue(end))}`,
  }
}

function normalizeStatus(status?: string): AppointmentStatus {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'confirmed'
    case 'completed':
    case 'concluded':
    case 'done':
      return 'completed'
    case 'cancelled':
    case 'canceled':
      return 'cancelled'
    case 'scheduled':
    case 'agendado':
    default:
      return 'scheduled'
  }
}

function normalizeAppointment(item: AppointmentApiItem): DashboardAppointment {
  const date = item.date || item.appointmentDate || ''
  const startTime = item.startTime || item.time || ''
  const endTime = item.endTime || ''
  const time = item.time || item.startTime || ''

  return {
    id: item.id,
    clientName: item.clientName || item.clientFullName || 'Cliente',
    serviceName: item.serviceName || 'Serviço',
    date,
    time,
    startTime,
    endTime,
    status: normalizeStatus(item.status),
    priceFormatted: item.priceFormatted || item.priceAtBookingFormatted || 'R$ 0,00',
  }
}

function getTimeBadge(appointment: DashboardAppointment) {
  if (appointment.startTime && appointment.endTime) {
    return `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`
  }

  return appointment.time?.slice(0, 5) || '--:--'
}

function normalizeMoney(formatted: string) {
  const numeric = Number(
    String(formatted)
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  )

  return Number.isNaN(numeric) ? 0 : numeric
}

export default function DashboardPage() {
  const today = useMemo(() => new Date(), [])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const currentUser = getCurrentUser()
  const isCatalogOnly =
    !!currentUser?.hasCatalogModule && !currentUser?.hasAppointmentsModule

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const userId = getCurrentUserId()

      const [summaryResponse, appointmentsResponse] = await Promise.all([
        api.get<DashboardSummary>(`/api/dashboard/summary?userId=${userId}&period=day`),
        api.get<AppointmentApiItem[]>(`/api/appointments?userId=${userId}`),
      ])

      setSummary({
        ...summaryResponse,
        upcomingAppointments: (summaryResponse.upcomingAppointments || []).map((item) => ({
          ...item,
          status: normalizeStatus(item.status),
        })),
      })

      setAppointments((appointmentsResponse || []).map(normalizeAppointment))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const todayValue = toDateInputValue(today)
  const currentWeek = getCurrentWeekRange(today)

  const weeklyAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      return (
        appointment.date >= currentWeek.startValue &&
        appointment.date <= currentWeek.endValue
      )
    })
  }, [appointments, currentWeek.endValue, currentWeek.startValue])

  const weeklyRevenue = useMemo(() => {
    return weeklyAppointments.reduce((total, item) => {
      return total + normalizeMoney(item.priceFormatted)
    }, 0)
  }, [weeklyAppointments])

  const todayAppointmentsCount = appointments.filter(
    (item) => item.date === todayValue
  ).length

  if (isCatalogOnly) {
    return <CatalogDashboard />
  }

  if (isLoading) {
    return <div className="feedback-card">Carregando dashboard...</div>
  }

  if (errorMessage) {
    return <div className="feedback-card error-box">{errorMessage}</div>
  }

  return (
    <div className="page-stack dashboard-v3-page">
      <SectionHeader
        title="Dashboard"
        description="Veja os principais indicadores e atalhos da sua operação."
        action={
          <div className="dashboard-v3-top-actions">
            <Link to={ROUTE_PATHS.appointments} className="secondary-button">
              Ver agenda
            </Link>

            <Link to={ROUTE_PATHS.createAppointment} className="primary-button">
              Novo agendamento
            </Link>

            <Link to={ROUTE_PATHS.createClient} className="secondary-button">
              Novo cliente
            </Link>
          </div>
        }
      />

      <div className="dashboard-v3-stats">
        <PageCard className="dashboard-v3-stat-card">
          <div className="dashboard-v3-stat-head">
            <div>
              <span className="dashboard-v3-stat-label">Hoje</span>
              <h2>{todayAppointmentsCount}</h2>
            </div>
            <div className="dashboard-v3-stat-icon">📅</div>
          </div>
          <p>Compromissos do dia atual.</p>
        </PageCard>

        <PageCard className="dashboard-v3-stat-card">
          <div className="dashboard-v3-stat-head">
            <div>
              <span className="dashboard-v3-stat-label">Semana</span>
              <h2>{weeklyAppointments.length}</h2>
            </div>
            <div className="dashboard-v3-stat-icon">🗓️</div>
          </div>
          <p>{currentWeek.label}</p>
        </PageCard>

        <PageCard className="dashboard-v3-stat-card">
          <div className="dashboard-v3-stat-head">
            <div>
              <span className="dashboard-v3-stat-label">Receita semanal</span>
              <h2>
                {weeklyRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </h2>
            </div>
            <div className="dashboard-v3-stat-icon">💰</div>
          </div>
          <p>Soma dos atendimentos desta semana.</p>
        </PageCard>
      </div>

      <div className="dashboard-v3-bottom-grid">
        <PageCard className="dashboard-v3-bottom-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Próximos agendamentos</h3>
              <p>Visão rápida das próximas marcações.</p>
            </div>
          </div>

          <div className="dashboard-appointments-list">
            {summary?.upcomingAppointments?.length ? (
              summary.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="dashboard-appointment-item">
                  <div className="dashboard-appointment-left">
                    <div className="dashboard-appointment-main">
                      <strong>{appointment.clientName}</strong>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="muted-text">{appointment.serviceName}</p>
                  </div>

                  <div className="dashboard-appointment-right">
                    <span className="soft-pill">{appointment.date}</span>
                    <span className="soft-pill">{getTimeBadge(appointment)}</span>
                    <span className="soft-pill">{appointment.priceFormatted}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">Nenhum agendamento encontrado.</div>
            )}
          </div>
        </PageCard>

        <PageCard className="dashboard-v3-bottom-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Clientes recentes</h3>
              <p>Últimos clientes cadastrados.</p>
            </div>
          </div>

          <div className="dashboard-clients-list">
            {summary?.recentClients?.length ? (
              summary.recentClients.map((client) => {
                const name = client.fullName || client.name || 'Cliente'

                return (
                  <div key={client.id} className="dashboard-client-item">
                    <div>
                      <strong>{name}</strong>
                      <p className="muted-text">{client.phone}</p>
                    </div>
                    <span className="secondary-button small-button">Ativo</span>
                  </div>
                )
              })
            ) : (
              <div className="empty-state">Nenhum cliente encontrado.</div>
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}
