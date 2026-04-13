export async function setupNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return

  // Register service worker
  let reg
  try {
    reg = await navigator.serviceWorker.register('/sw.js')
  } catch {
    return
  }

  // Request permission if not yet granted
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') return
  }

  if (Notification.permission !== 'granted') return

  // Tell the SW to schedule alarms
  const sw = reg.active || reg.waiting || reg.installing
  if (sw) {
    sw.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' })
  }
}
