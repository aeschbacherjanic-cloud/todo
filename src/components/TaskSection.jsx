import { useState } from 'react'

export default function TaskSection({ title, icon, tasks, onToggle, onHide, onRemoveCustom, onAdd }) {
  const done = tasks.filter(t => t.completed).length

  return (
    <section className="task-section">
      <div className="section-header">
        <div className="section-title-row">
          <span className="section-icon">{icon === 'sunrise' ? '🌅' : '🌙'}</span>
          <h2 className="section-title">{title}</h2>
          <span className="section-count">{done}/{tasks.length}</span>
        </div>
        <button className="add-btn" onClick={onAdd} aria-label="Aufgabe hinzufügen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <div className="empty-state">Keine Aufgaben</div>
        )}
        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => onToggle(task.id)}
            onHide={() => onHide(task.id)}
            onRemove={task.isCustom ? () => onRemoveCustom(task.id) : null}
          />
        ))}
      </div>
    </section>
  )
}

function TaskRow({ task, onToggle, onHide, onRemove }) {
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

  function handleDelete() {
    if (task.isCustom) onRemove()
    else onHide()
    setSwiped(false)
  }

  return (
    <div className="task-row-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={`task-row ${swiped ? 'swiped' : ''}`}>
        <button className={`checkbox ${task.completed ? 'checked' : ''}`} onClick={onToggle} aria-label="Erledigt">
          {task.completed && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <span className="task-icon-badge">{task.icon || '📝'}</span>
        <span className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</span>
      </div>
      {swiped && (
        <button className="delete-btn" onClick={handleDelete}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      )}
    </div>
  )
}
