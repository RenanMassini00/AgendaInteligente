import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PageCard from '../ui/PageCard'
import StatusBadge from '../ui/StatusBadge'
import type { Appointment } from '../../types/appointment.types'

type WeeklyAgendaProps = {
  appointments: Appointment[]
  isLoading: boolean
}

type AgendaAppointment = Appointment & {
  normalizedDate: string
  normalizedStartTime: string
  normalizedEndTime: string
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeDateValue(value?: string) {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10)
  }

  const brazilianDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/)

  if (brazilianDate) {
    const [, day, month, year] = brazilianDate
    return `${year}-${month}-${day}`
  }

  return value
}

function formatShortTime(value?: string) {
  if (!value) return ''

  return value.slice(0, 5)
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatLongDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
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

function getWeekRangeLabel(days: Array<{ value: string }>) {
  if (!days.length) return ''

  return `${formatDateLabel(days[0].value)} até ${formatDateLabel(days[days.length - 1].value)}`
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

function normalizeAppointment(appointment: Appointment): AgendaAppointment {
  return {
    ...appointment,
    normalizedDate: normalizeDateValue(appointment.date),
    normalizedStartTime: formatShortTime(appointment.startTime || appointment.time),
    normalizedEndTime: formatShortTime(appointment.endTime),
  }
}

function getTimeRange(appointment: AgendaAppointment) {
  if (appointment.normalizedStartTime && appointment.normalizedEndTime) {
    return `${appointment.normalizedStartTime} - ${appointment.normalizedEndTime}`
  }

  return appointment.normalizedStartTime || formatShortTime(appointment.time) || '--:--'
}

export default function WeeklyAgenda({ appointments, isLoading }: WeeklyAgendaProps) {
  const today = useMemo(() => new Date(), [])
  const todayValue = toDateInputValue(today)

  const [anchorDate, setAnchorDate] = useState(today)
  const [selectedDayValue, setSelectedDayValue] = useState(todayValue)

  const weekDays = useMemo(() => buildWeekDays(anchorDate), [anchorDate])

  useEffect(() => {
    const weekValues = weekDays.map((day) => day.value)

    if (weekValues.includes(todayValue)) {
      setSelectedDayValue(todayValue)
      return
    }

    if (!weekValues.includes(selectedDayValue)) {
      setSelectedDayValue(weekDays[0]?.value ?? '')
    }
  }, [selectedDayValue, todayValue, weekDays])

  const normalizedAppointments = useMemo(() => {
    return appointments
      .map(normalizeAppointment)
      .sort((a, b) => {
        if (a.normalizedDate !== b.normalizedDate) {
          return a.normalizedDate.localeCompare(b.normalizedDate)
        }

        return a.normalizedStartTime.localeCompare(b.normalizedStartTime)
      })
  }, [appointments])

  const weeklyAppointments = useMemo(() => {
    const weekValues = weekDays.map((day) => day.value)

    return normalizedAppointments.filter((appointment) =>
      weekValues.includes(appointment.normalizedDate)
    )
  }, [normalizedAppointments, weekDays])

  const appointmentsByDay = useMemo(() => {
    return weekDays.map((day) => ({
      ...day,
      appointments: weeklyAppointments.filter(
        (appointment) => appointment.normalizedDate === day.value
      ),
    }))
  }, [weekDays, weeklyAppointments])

  const selectedDay =
    appointmentsByDay.find((day) => day.value === selectedDayValue) ||
    appointmentsByDay[0]

  const weeklyRevenue = weeklyAppointments.reduce((total, appointment) => {
    return total + normalizeMoney(appointment.priceFormatted)
  }, 0)

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

  return (
    <PageCard className="appointments-agenda-shell">
      <div className="appointments-agenda-header">
        <div>
          <span className="appointments-agenda-kicker">Agenda semanal</span>
          <h3>Compromissos por dia</h3>
          <p>{getWeekRangeLabel(weekDays)}</p>
        </div>

        <div className="appointments-agenda-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft size={18} />
            Semana anterior
          </button>

          <button type="button" className="secondary-button" onClick={goToCurrentWeek}>
            <RotateCcw size={17} />
            Semana atual
          </button>

          <button type="button" className="secondary-button" onClick={goToNextWeek}>
            Próxima semana
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="appointments-agenda-stats">
        <div>
          <CalendarDays size={18} />
          <span>{weeklyAppointments.length} na semana</span>
        </div>
        <div>
          <span>
            {weeklyRevenue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <small>previsto</small>
        </div>
      </div>

      <div className="appointments-agenda-board-wrap">
        <div className="appointments-agenda-board">
          {appointmentsByDay.map((day) => {
            const isToday = day.value === todayValue

            return (
              <section
                key={day.value}
                className={`appointments-agenda-day ${isToday ? 'today' : ''}`.trim()}
              >
                <header>
                  <span>{day.shortLabel}</span>
                  <strong>{day.dayNumber}</strong>
                  <small>{day.appointments.length} agendamento(s)</small>
                </header>

                <div className="appointments-agenda-day-list">
                  {isLoading ? (
                    <div className="appointments-agenda-empty">Carregando...</div>
                  ) : day.appointments.length ? (
                    day.appointments.map((appointment) => (
                      <article key={appointment.id} className="appointments-agenda-card">
                        <div className="appointments-agenda-card-top">
                          <span className="appointments-agenda-time">
                            {getTimeRange(appointment)}
                          </span>
                          <StatusBadge status={appointment.status} />
                        </div>

                        <strong>{appointment.clientName}</strong>
                        <p>{appointment.serviceName}</p>

                        <span className="appointments-agenda-price">
                          {appointment.priceFormatted}
                        </span>
                      </article>
                    ))
                  ) : (
                    <div className="appointments-agenda-empty">Livre</div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <div className="appointments-agenda-mobile">
        <div className="appointments-agenda-day-strip">
          {appointmentsByDay.map((day) => {
            const isActive = day.value === selectedDayValue
            const isToday = day.value === todayValue

            return (
              <button
                key={day.value}
                type="button"
                className={`appointments-agenda-day-pill ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`.trim()}
                onClick={() => setSelectedDayValue(day.value)}
              >
                <span>{day.shortLabel}</span>
                <strong>{day.dayNumber}</strong>
                <small>{day.appointments.length} ag.</small>
              </button>
            )
          })}
        </div>

        <div className="appointments-agenda-mobile-list">
          <div className="appointments-agenda-mobile-title">
            <strong>{selectedDay?.fullLabel}</strong>
            <span>{selectedDay ? formatLongDate(selectedDay.value) : ''}</span>
          </div>

          {isLoading ? (
            <div className="appointments-agenda-empty">Carregando...</div>
          ) : selectedDay?.appointments.length ? (
            selectedDay.appointments.map((appointment) => (
              <article key={appointment.id} className="appointments-agenda-card">
                <div className="appointments-agenda-card-top">
                  <span className="appointments-agenda-time">
                    {getTimeRange(appointment)}
                  </span>
                  <StatusBadge status={appointment.status} />
                </div>

                <strong>{appointment.clientName}</strong>
                <p>{appointment.serviceName}</p>

                <span className="appointments-agenda-price">
                  {appointment.priceFormatted}
                </span>
              </article>
            ))
          ) : (
            <div className="appointments-agenda-empty">
              Nenhum compromisso neste dia.
            </div>
          )}
        </div>
      </div>
    </PageCard>
  )
}
