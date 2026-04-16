let swReg = null

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    swReg = await navigator.serviceWorker.register('/sw.js')
  } catch {}
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// Request permission if needed, then schedule based on current settings.
// Must be called from a user gesture on iOS.
export async function applyNotificationSettings(settings) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') return result
  }

  if (Notification.permission !== 'granted') return Notification.permission

  if (!swReg) swReg = await navigator.serviceWorker.ready

  const sw = swReg.active || swReg.waiting || swReg.installing
  if (sw) {
    sw.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', settings })
  }

  return 'granted'
}
