import { useState, useEffect, useCallback } from 'react'
import { WEEKDAY_FULL, dateKey, getTasksForDay, toggleComplete, hideTask, addCustomTask, removeCustomTask, isEveryOtherDay, isDayComplete } from './tasks.js'
import TaskSection from './components/TaskSection.jsx'
import AddTaskModal from './components/AddTaskModal.jsx'
import StreakPage from './components/StreakPage.jsx'
import GeneralTodos from './components/GeneralTodos.jsx'

function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isToday(date) {
  return dateKey(date) === dateKey(new Date())
}

export default function App() {
  const [tab, setTab] = useState('routine')
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  })
  const [tasks, setTasks] = useState({ morning: [], evening: [] })
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalTime, setAddModalTime] = useState('morning')
  const [dayComplete, setDayComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const refresh = useCallback(() => {
    const t = getTasksForDay(currentDate)
    setTasks(t)
    const all = [...t.morning, ...t.evening]
    const complete = all.length > 0 && all.every(x => x.completed)
    setDayComplete(complete)
  }, [currentDate])

  useEffect(() => { refresh() }, [refresh])

  function handleToggle(taskId) {
    toggleComplete(currentDate, taskId)
    const t = getTasksForDay(currentDate)
    setTasks(t)
    const all = [...t.morning, ...t.evening]
    const nowComplete = all.length > 0 && all.every(x => x.completed)
    if (nowComplete && !dayComplete) {
      setDayComplete(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } else {
      setDayComplete(nowComplete)
    }
  }

  function handleHide(taskId) { hideTask(currentDate, taskId); refresh() }
  function handleRemoveCustom(taskId) { removeCustomTask(currentDate, taskId); refresh() }
  function handleAddConfirm(title, time) { addCustomTask(currentDate, title, time); setShowAddModal(false); refresh() }

  const dayName = WEEKDAY_FULL[currentDate.getDay()]
  const today = isToday(currentDate)
  const physioDay = isEveryOtherDay(currentDate)
  const morningDone = tasks.morning.filter(t => t.completed).length
  const eveningDone = tasks.evening.filter(t => t.completed).length
  const totalDone = morningDone + eveningDone
  const totalAll = tasks.morning.length + tasks.evening.length

  return (
    <div className="app">
      <div className="status-bar-spacer" />

      {/* ── Tab content ── */}
      {tab === 'routine' && (
        <>
          <header className="header">
            <div className="header-top">
              <button className="nav-btn" onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d)
              }}>
                <ChevronLeft />
              </button>
              <div className="header-title-group" onClick={!today ? () => {
                const d = new Date(); d.setHours(0,0,0,0); setCurrentDate(d)
              } : undefined} style={{ cursor: today ? 'default' : 'pointer' }}>
                <h1 className="header-day">{today ? 'Heute' : dayName}</h1>
                <p className="header-date">{formatDate(currentDate)}</p>
              </div>
              <button className="nav-btn" onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d)
              }}>
                <ChevronRight />
              </button>
            </div>

            <div className="progress-bar-wrap">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: totalAll > 0 ? `${(totalDone / totalAll) * 100}%` : '0%' }} />
              </div>
              <span className="progress-label">{totalDone}/{totalAll} erledigt</span>
            </div>

            <div className="header-badges">
              {physioDay && <div className="badge physio-badge">🏃 Physio-Tag</div>}
              {dayComplete && <div className="badge complete-badge">🎉 Alles erledigt!</div>}
            </div>
          </header>

          {showConfetti && <Confetti />}

          <main className="main">
            <TaskSection
              title="Morgen" icon="sunrise" tasks={tasks.morning}
              onToggle={handleToggle} onHide={handleHide}
              onRemoveCustom={handleRemoveCustom}
              onAdd={() => { setAddModalTime('morning'); setShowAddModal(true) }}
            />
            <TaskSection
              title="Abend" icon="sunset" tasks={tasks.evening}
              onToggle={handleToggle} onHide={handleHide}
              onRemoveCustom={handleRemoveCustom}
              onAdd={() => { setAddModalTime('evening'); setShowAddModal(true) }}
            />
          </main>

          {showAddModal && (
            <AddTaskModal time={addModalTime} onConfirm={handleAddConfirm} onClose={() => setShowAddModal(false)} />
          )}
        </>
      )}

      {tab === 'streak' && (
        <>
          <header className="header simple-header">
            <h1 className="header-day">Übersicht</h1>
          </header>
          <main className="main">
            <StreakPage />
          </main>
        </>
      )}

      {tab === 'todos' && (
        <>
          <header className="header simple-header">
            <h1 className="header-day">Todos</h1>
          </header>
          <main className="main">
            <GeneralTodos />
          </main>
        </>
      )}

      {/* ── Tab Bar ── */}
      <nav className="tab-bar">
        <button className={`tab-item ${tab === 'routine' ? 'active' : ''}`} onClick={() => setTab('routine')}>
          <TabIcon name="routine" active={tab === 'routine'} />
          <span>Routine</span>
        </button>
        <button className={`tab-item ${tab === 'streak' ? 'active' : ''}`} onClick={() => setTab('streak')}>
          <TabIcon name="streak" active={tab === 'streak'} />
          <span>Streak</span>
        </button>
        <button className={`tab-item ${tab === 'todos' ? 'active' : ''}`} onClick={() => setTab('todos')}>
          <TabIcon name="todos" active={tab === 'todos'} />
          <span>Todos</span>
        </button>
      </nav>
      <div className="tab-bar-spacer" />
    </div>
  )
}

function TabIcon({ name, active }) {
  const color = active ? '#007AFF' : '#8E8E93'
  if (name === 'routine') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" /><line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5" /><line x1="8" y1="18" x2="8" y2="18" strokeWidth="2.5" />
    </svg>
  )
  if (name === 'streak') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#007AFF' : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v6l4 2" stroke={active ? 'white' : color} />
    </svg>
  )
  if (name === 'todos') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <polyline points="3 6 4 7 6 5" /><polyline points="3 12 4 13 6 11" /><polyline points="3 18 4 19 6 17" />
    </svg>
  )
}

function ChevronLeft() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
}
function ChevronRight() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
}

function Confetti() {
  const colors = ['#007AFF','#34C759','#FF9500','#FF3B30','#5856D6','#FFD700']
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  }))
  return (
    <div className="confetti-wrap" aria-hidden>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          background: p.color,
          width: p.size,
          height: p.size,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  )
}
