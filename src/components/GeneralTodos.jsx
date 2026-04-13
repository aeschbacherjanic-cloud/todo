import { useState, useRef, useEffect } from 'react'
import { loadGeneralTodos, saveGeneralTodos } from '../tasks.js'

export default function GeneralTodos() {
  const [todos, setTodos] = useState(() => loadGeneralTodos())
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function persist(next) {
    setTodos(next)
    saveGeneralTodos(next)
  }

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    persist([
      ...todos,
      { id: `todo-${Date.now()}`, title: trimmed, done: false },
    ])
    setInput('')
  }

  function handleToggle(id) {
    persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function handleDelete(id) {
    persist(todos.filter(t => t.id !== id))
  }

  function handleClearDone() {
    persist(todos.filter(t => !t.done))
  }

  const open = todos.filter(t => !t.done)
  const done = todos.filter(t => t.done)

  return (
    <div className="general-todos">
      {/* Add input */}
      <form className="todo-input-row" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          className="todo-input"
          placeholder="Neue Aufgabe..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={120}
        />
        <button className="todo-add-btn" type="submit" disabled={!input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </form>

      {/* Open tasks */}
      {open.length > 0 && (
        <div className="card">
          <h3 className="card-title">Offen ({open.length})</h3>
          <div className="todo-list">
            {open.map(t => (
              <TodoRow key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Done tasks */}
      {done.length > 0 && (
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Erledigt ({done.length})</h3>
            <button className="clear-done-btn" onClick={handleClearDone}>Löschen</button>
          </div>
          <div className="todo-list">
            {done.map(t => (
              <TodoRow key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div className="empty-page">
          <span className="empty-page-icon">✅</span>
          <p>Noch keine Todos.</p>
          <p className="empty-page-sub">Füge oben eine Aufgabe hinzu.</p>
        </div>
      )}
    </div>
  )
}

function TodoRow({ todo, onToggle, onDelete }) {
  const [swiped, setSwiped] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

  function handleTouchStart(e) { setTouchStart(e.touches[0].clientX) }
  function handleTouchEnd(e) {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > 60) setSwiped(true)
    else if (diff < -30) setSwiped(false)
    setTouchStart(null)
  }

  return (
    <div className="task-row-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={`task-row ${swiped ? 'swiped' : ''}`}>
        <button className={`checkbox ${todo.done ? 'checked' : ''}`} onClick={() => onToggle(todo.id)}>
          {todo.done && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <span className="task-icon-badge">📋</span>
        <span className={`task-title ${todo.done ? 'done' : ''}`}>{todo.title}</span>
      </div>
      {swiped && (
        <button className="delete-btn" onClick={() => { onDelete(todo.id); setSwiped(false) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      )}
    </div>
  )
}
