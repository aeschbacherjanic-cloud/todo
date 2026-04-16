// Service Worker for Daily Routine notifications
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})

// Receive schedule config from the app
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    const settings = e.data.settings || {
      morningEnabled: true, morningTime: '07:00',
      eveningEnabled: true, eveningTime: '21:30',
    }
    scheduleAlarms(settings)
  }
})

let morningTimer = null
let eveningTimer = null

function msUntil(hhmm) {
  const [hour, minute] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target - now
}

function scheduleAlarms(settings) {
  // Clear existing timers
  if (morningTimer) clearTimeout(morningTimer)
  if (eveningTimer) clearTimeout(eveningTimer)

  if (settings.morningEnabled) {
    const fireAndReschedule = () => {
      self.registration.showNotification('Guten Morgen! 🌅', {
        body: 'Deine Morgen-Routine wartet auf dich.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'morning-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
      })
      morningTimer = setTimeout(fireAndReschedule, msUntil(settings.morningTime))
    }
    morningTimer = setTimeout(fireAndReschedule, msUntil(settings.morningTime))
  }

  if (settings.eveningEnabled) {
    const fireAndReschedule = () => {
      self.registration.showNotification('Guten Abend! 🌙', {
        body: 'Vergiss deine Abend-Routine nicht.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'evening-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
      })
      eveningTimer = setTimeout(fireAndReschedule, msUntil(settings.eveningTime))
    }
    eveningTimer = setTimeout(fireAndReschedule, msUntil(settings.eveningTime))
  }
}
