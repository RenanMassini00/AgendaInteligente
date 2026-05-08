import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
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
  topServices: DashboardService[]
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

type DashboardService = {
  id: number
  name: string
  duration: string
  priceFormatted: string
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

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAY_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const TIME_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
]

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
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

function buildWeekDays(baseDate: Date) {
  const start = getWeekStart(baseDate)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    return {
      date,
      value: toDateInputValue(date),
      shortLabel: WEEKDAY_SHORT[date.getDay()],
      fullLabel: WEEKDAY_FULL[date.getDay()],
      dayNumber: date.getDate(),
    }
  })
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

function getWeekRangeLabel(days: Array<{ value: string }>) {
  if (!days.length) return ''

  const first = days[0].value
  const last = days[days.length - 1].value

  return `${formatDateLabel(first)} até ${formatDateLabel(last)}`
}

function getTimeBadge(appointment: DashboardAppointment) {
  if (appointment.startTime && appointment.endTime) {
    return `${appointment.startTime} - ${appointment.endTime}`
  }

  return appointment.time || '--:--'
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
  const today = new Date()

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [anchorDate, setAnchorDate] = useState(today)

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

  function goToPreviousWeek() {
    setAnchorDate((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() - 7)
      return next
    })
  }

  function goToNextWeek() {
    setAnchorDate((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + 7)
      return next
    })
  }

  function goToCurrentWeek() {
    setAnchorDate(new Date())
  }

  const weekDays = useMemo(() => buildWeekDays(anchorDate), [anchorDate])

  const weeklyAppointments = useMemo(() => {
    const weekValues = weekDays.map((day) => day.value)
    return appointments
      .filter((item) => weekValues.includes(item.date))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return (a.startTime || a.time).localeCompare(b.startTime || b.time)
      })
  }, [appointments, weekDays])

  const weeklyRevenue = useMemo(() => {
    return weeklyAppointments.reduce((total, item) => {
      return total + normalizeMoney(item.priceFormatted)
    }, 0)
  }, [weeklyAppointments])

  const weeklyCount = weeklyAppointments.length

  const todayValue = toDateInputValue(today)
  const todayAppointmentsCount = appointments.filter((item) => item.date === todayValue).length

  const gridData = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const slotHour = slot.slice(0, 2)

      return {
        slot,
        days: weekDays.map((day) => {
          const items = weeklyAppointments.filter((appointment) => {
            const start = appointment.startTime || appointment.time || ''
            return appointment.date === day.value && start.startsWith(slotHour)
          })

          return {
            date: day.value,
            items,
          }
        }),
      }
    })
  }, [weekDays, weeklyAppointments])

  if (isLoading) {
    return <div className="feedback-card">Carregando dashboard...</div>
  }

  if (errorMessage) {
    return <div className="feedback-card error-box">{errorMessage}</div>
  }

  return (
    <div className="page-stack dashboard-week-page">
      <SectionHeader
        title="Dashboard semanal"
        description="Visualize sua agenda em formato de calendário profissional."
        action={
          <div className="dashboard-top-actions">
            <button type="button" className="secondary-button" onClick={goToCurrentWeek}>
              Semana atual
            </button>

            <Link to={ROUTE_PATHS.createAppointment} className="primary-button">
              Novo agendamento
            </Link>

            <Link to={ROUTE_PATHS.createClient} className="secondary-button">
              Novo cliente
            </Link>
          </div>
        }
      />

      <div className="dashboard-highlight-grid">
        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Agendamentos hoje</p>
              <h2 className="dashboard-highlight-number">{todayAppointmentsCount}</h2>
            </div>
            <div className="dashboard-highlight-icon">📅</div>
          </div>
          <p className="dashboard-highlight-text">
            Compromissos do dia atual.
          </p>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Agendamentos da semana</p>
              <h2 className="dashboard-highlight-number">{weeklyCount}</h2>
            </div>
            <div className="dashboard-highlight-icon">🗓️</div>
          </div>
          <p className="dashboard-highlight-text">
            {getWeekRangeLabel(weekDays)}
          </p>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Receita da semana</p>
              <h2 className="dashboard-highlight-number">
                {weeklyRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </h2>
            </div>
            <div className="dashboard-highlight-icon">💰</div>
          </div>
          <p className="dashboard-highlight-text">
            Soma dos atendimentos desta semana.
          </p>
        </PageCard>
      </div>

      <PageCard className="weekly-calendar-shell">
        <div className="weekly-calendar-header">
          <div>
            <h3>Agenda da semana</h3>
            <p>{getWeekRangeLabel(weekDays)}</p>
          </div>

          <div className="weekly-calendar-nav">
            <button type="button" className="secondary-button" onClick={goToPreviousWeek}>
              ← Semana anterior
            </button>

            <button type="button" className="secondary-button" onClick={goToNextWeek}>
              Próxima semana →
            </button>
          </div>
        </div>

        <div className="weekly-calendar-grid">
          <div className="weekly-grid-corner" />

          {weekDays.map((day) => {
            const isToday = day.value === todayValue

            return (
              <div
                key={day.value}
                className={`weekly-day-header ${isToday ? 'today' : ''}`.trim()}
              >
                <span>{day.shortLabel}</span>
                <strong>{day.dayNumber}</strong>
              </div>
            )
          })}

          {gridData.map((row) => (
            <div key={row.slot} className="weekly-row-fragment">
              <div className="weekly-time-cell">{row.slot}</div>

              {row.days.map((day) => (
                <div key={`${row.slot}-${day.date}`} className="weekly-slot-cell">
                  {day.items.length === 0 ? (
                    <div className="weekly-slot-empty" />
                  ) : (
                    day.items.map((appointment) => (
                      <div className="weekly-appointment-card">
                        <div className="weekly-appointment-top">
                          <div className="weekly-appointment-title-group">
                            <strong>{appointment.clientName}</strong>
                            <p className="weekly-appointment-service">{appointment.serviceName}</p>
                          </div>

                          <div className="weekly-appointment-status-wrap">
                            <StatusBadge status={appointment.status} />
                          </div>
                        </div>

                        <div className="weekly-appointment-meta">
                          <span className="soft-pill">{getTimeBadge(appointment)}</span>
                          <span className="soft-pill">{appointment.priceFormatted}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </PageCard>

      <div className="dashboard-main-grid">
        <PageCard className="dashboard-main-card">
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
                    <span className="soft-pill">{appointment.time}</span>
                    <span className="soft-pill">{appointment.priceFormatted}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">Nenhum agendamento encontrado.</div>
            )}
          </div>
        </PageCard>

        <PageCard className="dashboard-side-card">
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