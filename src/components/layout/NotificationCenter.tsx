import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  Info,
  X,
} from 'lucide-react'
import { api } from '../../utils/api'
import { getCurrentUserId } from '../../utils/auth'

type NotificationKind = 'appointment' | 'system'

type NotificationItem = {
  id: string
  kind: NotificationKind
  title: string
  description: string
  dateLabel?: string
}

type AppointmentNotification = {
  id: number
  clientName?: string
  clientFullName?: string
  serviceName?: string
  appointmentDate?: string
  date?: string
  startTime?: string
  time?: string
  status?: string
}

function getReadNotificationsKey() {
  return `scheduler_read_notifications_${getCurrentUserId()}`
}

function formatAppointmentDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(parsed)
}

function isUpcomingAppointment(item: AppointmentNotification) {
  const date = item.date || item.appointmentDate
  if (!date) return false

  const appointmentDate = new Date(`${date}T${item.startTime || item.time || '23:59'}:00`)
  return !Number.isNaN(appointmentDate.getTime()) && appointmentDate >= new Date()
}

function readStoredIds() {
  try {
    const value = JSON.parse(localStorage.getItem(getReadNotificationsKey()) || '[]')
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
      ? value
      : []
  } catch {
    return []
  }
}

export default function NotificationCenter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [appointments, setAppointments] = useState<NotificationItem[]>([])
  const [readIds, setReadIds] = useState<string[]>(readStoredIds)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadNotifications() {
      try {
        const response = await api.get<AppointmentNotification[]>(
          `/api/appointments?userId=${getCurrentUserId()}`
        )

        if (!isMounted) return

        const upcoming = response
          .filter(isUpcomingAppointment)
          .sort((first, second) => {
            const firstValue = first.date || first.appointmentDate || ''
            const secondValue = second.date || second.appointmentDate || ''
            return `${firstValue}${first.startTime || first.time || ''}`.localeCompare(
              `${secondValue}${second.startTime || second.time || ''}`
            )
          })
          .slice(0, 3)
          .map((item) => {
            const date = item.date || item.appointmentDate || ''
            const time = (item.startTime || item.time || '').slice(0, 5)

            return {
              id: `appointment-${item.id}`,
              kind: 'appointment' as const,
              title: `Agendamento com ${item.clientName || item.clientFullName || 'cliente'}`,
              description: `${item.serviceName || 'Atendimento'}${time ? ` às ${time}` : ''}`,
              dateLabel: formatAppointmentDate(date),
            }
          })

        setAppointments(upcoming)
      } catch {
        if (isMounted) setHasLoadError(true)
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const notifications = useMemo<NotificationItem[]>(
    () => [
      {
        id: 'system-welcome',
        kind: 'system',
        title: 'Central de notificações ativa',
        description: 'Você receberá aqui avisos da agenda e atualizações do sistema.',
      },
      ...appointments,
    ],
    [appointments]
  )

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length

  function persistReadIds(nextIds: string[]) {
    setReadIds(nextIds)
    localStorage.setItem(getReadNotificationsKey(), JSON.stringify(nextIds))
  }

  function markAsRead(id: string) {
    if (readIds.includes(id)) return
    persistReadIds([...readIds, id])
  }

  function markAllAsRead() {
    persistReadIds([...new Set([...readIds, ...notifications.map((item) => item.id)])])
  }

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        type="button"
        className={`notification-trigger ${isOpen ? 'notification-trigger--active' : ''}`}
        aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell size={19} aria-hidden="true" />
        {unreadCount ? <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <section className="notification-panel" aria-label="Notificações">
          <div className="notification-panel-header">
            <div>
              <strong>Notificações</strong>
              <span>{unreadCount ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia'}</span>
            </div>
            <button type="button" className="notification-close" aria-label="Fechar notificações" onClick={() => setIsOpen(false)}>
              <X size={17} />
            </button>
          </div>

          <div className="notification-list">
            {notifications.map((item) => {
              const isUnread = !readIds.includes(item.id)

              return (
                <button
                  type="button"
                  className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                >
                  <span className={`notification-item-icon notification-item-icon--${item.kind}`}>
                    {item.kind === 'appointment' ? <CalendarDays size={17} /> : <Info size={17} />}
                  </span>
                  <span className="notification-item-content">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                    {item.dateLabel ? <small>{item.dateLabel}</small> : null}
                  </span>
                  {isUnread ? <span className="notification-unread-dot" aria-label="Não lida" /> : null}
                </button>
              )
            })}

            {hasLoadError ? (
              <p className="notification-feedback">Não foi possível atualizar os avisos da agenda agora.</p>
            ) : null}
          </div>

          <div className="notification-panel-footer">
            <button type="button" className="notification-mark-read" onClick={markAllAsRead}>
              <Check size={15} />
              Marcar todas como lidas
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
