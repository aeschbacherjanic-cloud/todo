const KEY = 'daily-routine-settings-v1'

export const DEFAULT_SETTINGS = {
  morningEnabled: true,
  morningTime: '07:00',
  eveningEnabled: true,
  eveningTime: '21:30',
}

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
}
