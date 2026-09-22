self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let data = {}

      if (event.data) {
        try {
          data = event.data.json()
        } catch {
          data = { body: event.data.text() }
        }
      }

      await self.registration.showNotification(data.title || 'Agenda Inteligente', {
        body: data.body || data.message || '',
        icon: data.icon || '/favicon.svg',
        badge: data.badge || '/favicon.svg',
        tag: data.tag || 'agenda-notification',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: data.url || '/',
          appointmentId: data.appointmentId || null,
        },
      })
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const current = windows.find((client) => 'focus' in client)

      if (current) {
        current.navigate(url)
        return current.focus()
      }

      return clients.openWindow(url)
    })
  )
})
