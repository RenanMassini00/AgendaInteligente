import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CalendarDays, Check, ExternalLink, Info, Smartphone, X } from 'lucide-react'
import { api } from '../../utils/api'
import { getCurrentUserId } from '../../utils/auth'
import {
  enablePushNotifications,
  sendPushTestNotification,
} from '../../services/pushNotifications'

type NotificationKind = 'appointment' | 'system'

type ApiNotification = {
  id: number
  title?: string
  message?: string
  description?: string
  type?: string
  category?: string
  isRead?: boolean
  read?: boolean
  createdAt?: string
  calendarUrl?: string | null
}

type NotificationItem = {
  id: number
  kind: NotificationKind
  title: string
  description: string
  createdAt?: string
  calendarUrl?: string | null
  isRead: boolean
}

function normalizeNotification(item: ApiNotification): NotificationItem {
  const kind: NotificationKind =
    item.type?.toLowerCase().includes('system') ||
    item.category?.toLowerCase().includes('system')
      ? 'system'
      : 'appointment'

  return {
    id: item.id,
    kind,
    title: item.title || (kind === 'appointment' ? 'Atualização de agendamento' : 'Atualização do sistema'),
    description: item.message || item.description || 'Você tem uma nova notificação.',
    createdAt: item.createdAt,
    calendarUrl: item.calendarUrl,
    isRead: item.isRead ?? item.read ?? false,
  }
}

function formatCreatedAt(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function NotificationCenter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [hasLoadError, setHasLoadError] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [isEnablingPush, setIsEnablingPush] = useState(false)
  const [isSendingPushTest, setIsSendingPushTest] = useState(false)
  const [pushMessage, setPushMessage] = useState('')

  const loadNotifications = useCallback(async () => {
    try {
      setHasLoadError(false)
      const response = await api.get<ApiNotification[]>(
        `/api/notifications?userId=${getCurrentUserId()}`
      )
      setNotifications((response || []).map(normalizeNotification))
    } catch {
      setHasLoadError(true)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()

    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadNotifications()
      }
    }, 30_000)

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadNotifications()
      }
    }

    window.addEventListener('focus', loadNotifications)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', loadNotifications)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadNotifications])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  )

  async function markAsRead(item: NotificationItem) {
    if (item.isRead) return

    try {
      await api.patch(`/api/notifications/${item.id}/read?userId=${getCurrentUserId()}`)
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? { ...notification, isRead: true } : notification
        )
      )
    } catch {
      setHasLoadError(true)
    }
  }

  async function markAllAsRead() {
    setIsMarkingAll(true)
    try {
      await Promise.all(
        notifications
          .filter((item) => !item.isRead)
          .map((item) =>
            api.patch(`/api/notifications/${item.id}/read?userId=${getCurrentUserId()}`)
          )
      )
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    } catch {
      setHasLoadError(true)
    } finally {
      setIsMarkingAll(false)
    }
  }

  async function handleEnablePush() {
    setIsEnablingPush(true)
    setPushMessage('')

    try {
      const result = await enablePushNotifications()
      setPushMessage(
        result.status === 'enabled'
          ? 'Celular ativado para receber notificações.'
          : result.status === 'denied'
            ? 'Permissão bloqueada. Libere as notificações nas configurações do navegador.'
            : result.status === 'unsupported'
              ? 'Este navegador não oferece suporte a notificações push.'
              : 'O serviço de notificações não está disponível no momento.'
      )
    } catch (error) {
      setPushMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível ativar as notificações no celular.'
      )
    } finally {
      setIsEnablingPush(false)
    }
  }

  async function handleSendPushTest() {
    setIsSendingPushTest(true)
    setPushMessage('')

    try {
      await sendPushTestNotification()
      setPushMessage('Teste enviado. Verifique o celular em alguns segundos.')
    } catch (error) {
      setPushMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o teste para o celular.'
      )
    } finally {
      setIsSendingPushTest(false)
    }
  }

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        type="button"
        className={`notification-trigger ${isOpen ? 'notification-trigger--active' : ''}`}
        aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ''}`}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current)
          if (!isOpen) void loadNotifications()
        }}
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
            {notifications.length === 0 && !hasLoadError ? (
              <p className="notification-feedback">Nenhuma notificação no momento.</p>
            ) : null}

            {notifications.map((item) => (
              <div className={`notification-item ${!item.isRead ? 'notification-item--unread' : ''}`} key={item.id}>
                <button type="button" className="notification-item-main" onClick={() => markAsRead(item)}>
                  <span className={`notification-item-icon notification-item-icon--${item.kind}`}>
                    {item.kind === 'appointment' ? <CalendarDays size={17} /> : <Info size={17} />}
                  </span>
                  <span className="notification-item-content">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                    {item.createdAt ? <small>{formatCreatedAt(item.createdAt)}</small> : null}
                  </span>
                  {!item.isRead ? <span className="notification-unread-dot" aria-label="Não lida" /> : null}
                </button>
                {item.calendarUrl ? (
                  <a className="notification-calendar-link" href={item.calendarUrl} target="_blank" rel="noreferrer" aria-label="Adicionar ao Google Agenda">
                    <ExternalLink size={15} />
                  </a>
                ) : null}
              </div>
            ))}

            {hasLoadError ? (
              <p className="notification-feedback">Não foi possível atualizar as notificações agora.</p>
            ) : null}
          </div>

          <div className="notification-panel-footer">
            <button
              type="button"
              className="notification-push-button"
              onClick={handleEnablePush}
              disabled={isEnablingPush}
            >
              <Smartphone size={15} />
              {isEnablingPush ? 'Ativando celular...' : 'Ativar notificações no celular'}
            </button>
            {pushMessage ? <p className="notification-push-message">{pushMessage}</p> : null}
            <button
              type="button"
              className="notification-mark-read"
              onClick={handleSendPushTest}
              disabled={isSendingPushTest || isEnablingPush}
            >
              {isSendingPushTest ? 'Enviando teste...' : 'Enviar notificação de teste'}
            </button>
            <button type="button" className="notification-mark-read" onClick={markAllAsRead} disabled={isMarkingAll || unreadCount === 0}>
              <Check size={15} />
              {isMarkingAll ? 'Atualizando...' : 'Marcar todas como lidas'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
