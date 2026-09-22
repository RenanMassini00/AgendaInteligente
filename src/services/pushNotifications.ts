import { api } from '../utils/api'
import { getAuthToken, getCurrentUserId } from '../utils/auth'

type PublicKeyResponse = {
  enabled?: boolean
  publicKey?: string
}

type PushSubscriptionPayload = {
  endpoint: string
  expirationTime: number | null
  keys?: PushSubscriptionJSON['keys']
  userAgent: string
  deviceName: string
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)))
}

export type PushEnableResult =
  | { status: 'enabled' }
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'unavailable' }

export async function enablePushNotifications(): Promise<PushEnableResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return { status: 'unsupported' }
  }

  if (Notification.permission === 'denied') {
    return { status: 'denied' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { status: 'denied' }
  }

  const keyResponse = await api.get<PublicKeyResponse>('/api/push/public-key')
  if (!keyResponse.enabled || !keyResponse.publicKey) {
    return { status: 'unavailable' }
  }

  await navigator.serviceWorker.register('/push-sw.js', { scope: '/' })
  const registration = await navigator.serviceWorker.ready
  await registration.update()
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription =
    existingSubscription ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyResponse.publicKey),
    }))
  const subscriptionJson = subscription.toJSON()
  const keys = subscriptionJson.keys ?? (() => {
    const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'))
    const auth = arrayBufferToBase64(subscription.getKey('auth'))

    if (!p256dh || !auth) {
      throw new Error('Push subscription keys are unavailable')
    }

    return { p256dh, auth }
  })()

  await api.post(
    `/api/push/subscriptions?userId=${getCurrentUserId()}`,
    {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys,
      userAgent: navigator.userAgent,
      deviceName: navigator.platform,
    } satisfies PushSubscriptionPayload
  )

  return { status: 'enabled' }
}

function arrayBufferToBase64(value: ArrayBuffer | null) {
  if (!value) return undefined

  const bytes = new Uint8Array(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return window.btoa(binary)
}

export async function sendPushTestNotification() {
  await api.post(`/api/push/test?userId=${getCurrentUserId()}`, {
    title: 'Teste de notificação',
    body: 'Seu celular está conectado ao Agenda Inteligente.',
    url: '/dashboard',
  })
}

export async function removePushSubscription() {
  if (!('serviceWorker' in navigator) || !getAuthToken()) return

  const registration = await navigator.serviceWorker.getRegistration('/push-sw.js')
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return

  await api.delete(`/api/push/subscriptions?userId=${getCurrentUserId()}`, {
    endpoint: subscription.endpoint,
  })
  await subscription.unsubscribe()
}
