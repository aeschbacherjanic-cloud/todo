// Service Worker for Daily Routine notifications
const CACHE = 'daily-routine-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// Handle notification clicks — open the app
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})

// Called from the main app to schedule both daily alarms
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAlarms()
  }
})

function msUntil(hour, minute) {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target - now
}

function scheduleAlarms() {
  // Morning: 07:00
  setTimeout(() => {
    self.registration.showNotification('Guten Morgen! 🌅', {
      body: 'Deine Morgen-Routine wartet auf dich.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'morning-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
    })
    scheduleAlarms() // reschedule for next day
  }, msUntil(7, 0))

  // Evening: 21:30
  setTimeout(() => {
    self.registration.showNotification('Guten Abend! 🌙', {
      body: 'Vergiss deine Abend-Routine nicht.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'evening-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
    })
  }, msUntil(21, 30))
}

// Auto-start scheduling on SW activation
scheduleAlarms()
