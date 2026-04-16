let swReg = null

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    swReg = await navigator.serviceWorker.register('/sw.js')
  } catch {}
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// Must be called directly from a user tap (iOS requirement)
export async function requestNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  const result = await Notification.requestPermission()
  if (result !== 'granted') return result
  if (!swReg) swReg = await navigator.serviceWorker.ready
  const sw = swReg.active || swReg.waiting || swReg.installing
  if (sw) sw.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' })
  return 'granted'
}
