import { useState, useEffect, useRef } from 'react'

export default function AddTaskModal({ time, onConfirm, onClose }) {
  const [title, setTitle] = useState('')
  const [selectedTime, setSelectedTime] = useState(time)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onConfirm(trimmed, selectedTime)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="modal-title">Neue Aufgabe</h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="modal-input"
            type="text"
            placeholder="Aufgabe eingeben..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={80}
          />

          <div className="time-picker">
            <button
              type="button"
              className={`time-option ${selectedTime === 'morning' ? 'active' : ''}`}
              onClick={() => setSelectedTime('morning')}
            >
              🌅 Morgen
            </button>
            <button
              type="button"
              className={`time-option ${selectedTime === 'evening' ? 'active' : ''}`}
              onClick={() => setSelectedTime('evening')}
            >
              🌙 Abend
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn cancel" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="modal-btn confirm" disabled={!title.trim()}>Hinzufügen</button>
          </div>
        </form>
      </div>
    </div>
  )
}
