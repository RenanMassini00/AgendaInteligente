export async function showLocalPushTest() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    throw new Error('Este navegador não oferece suporte a notificações.')
  }

  if (Notification.permission !== 'granted') {
    throw new Error('A permissão de notificações ainda não foi concedida.')
  }

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification('Teste local do Agenda Inteligente', {
    body: 'O celular consegue exibir notificações. Se este aviso aparecer, o problema está no envio ou cadastro do backend.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'agenda-local-test',
  })
}

export async function getPushSubscriptionState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported' as const
  }

  const registration = await navigator.serviceWorker.getRegistration('/push-sw.js')
  const subscription = await registration?.pushManager.getSubscription()

  return subscription ? 'subscribed' as const : 'not-subscribed' as const
}
