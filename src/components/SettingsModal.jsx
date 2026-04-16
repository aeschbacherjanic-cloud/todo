import { useState } from 'react'
import { loadSettings, saveSettings } from '../settings.js'
import { applyNotificationSettings } from '../notifications.js'

export default function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState(() => loadSettings())
  const [notifStatus, setNotifStatus] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  )
  const [saving, setSaving] = useState(false)

  function update(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    saveSettings(settings)

    const anyEnabled = settings.morningEnabled || settings.eveningEnabled
    if (anyEnabled) {
      const result = await applyNotificationSettings(settings)
      setNotifStatus('Notification' in window ? Notification.permission : 'unsupported')
    }

    setSaving(false)
    onClose()
  }

  const supported = notifStatus !== 'unsupported'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="modal-title">Einstellungen</h3>

        <div className="settings-section">
          <p className="settings-section-label">Erinnerungen</p>

          {!supported && (
            <div className="settings-warning">
              Benachrichtigungen werden von diesem Browser nicht unterstützt.
              Installiere die App auf dem Home-Bildschirm via Safari.
            </div>
          )}

          {notifStatus === 'denied' && (
            <div className="settings-warning">
              Benachrichtigungen sind blockiert. Bitte in den iOS-Einstellungen
              unter Safari → Mitteilungen aktivieren.
            </div>
          )}

          {/* Morning */}
          <div className="settings-row">
            <div className="settings-row-left">
              <span className="settings-row-icon">🌅</span>
              <div>
                <p className="settings-row-title">Morgen-Erinnerung</p>
                <p className="settings-row-sub">Täglich zur gewählten Zeit</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.morningEnabled}
                onChange={e => update('morningEnabled', e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>

          {settings.morningEnabled && (
            <div className="settings-time-row">
              <span className="settings-time-label">Uhrzeit</span>
              <input
                type="time"
                className="time-input"
                value={settings.morningTime}
                onChange={e => update('morningTime', e.target.value)}
              />
            </div>
          )}

          <div className="settings-divider" />

          {/* Evening */}
          <div className="settings-row">
            <div className="settings-row-left">
              <span className="settings-row-icon">🌙</span>
              <div>
                <p className="settings-row-title">Abend-Erinnerung</p>
                <p className="settings-row-sub">Täglich zur gewählten Zeit</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.eveningEnabled}
                onChange={e => update('eveningEnabled', e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>

          {settings.eveningEnabled && (
            <div className="settings-time-row">
              <span className="settings-time-label">Uhrzeit</span>
              <input
                type="time"
                className="time-input"
                value={settings.eveningTime}
                onChange={e => update('eveningTime', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>Abbrechen</button>
          <button className="modal-btn confirm" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
