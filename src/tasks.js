// Schedule types:
// 'daily'         — every day
// 'every-other'   — every other day, starting from a fixed epoch date
// ['mon','wed']   — specific weekdays

export const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export const WEEKDAY_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

// Epoch date for "every-other-day" calculation (a known physio day)
const EVERY_OTHER_EPOCH = new Date('2026-04-13').getTime()
const MS_PER_DAY = 86400000

export function isEveryOtherDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - EVERY_OTHER_EPOCH) / MS_PER_DAY)
  return diff % 2 === 0
}

export function dateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function taskAppliesToDate(task, date) {
  const d = new Date(date)
  const dow = d.getDay()
  if (task.schedule === 'daily') return true
  if (task.schedule === 'every-other') return isEveryOtherDay(date)
  if (Array.isArray(task.schedule)) return task.schedule.includes(dow)
  return false
}

// Default built-in tasks
export const DEFAULT_TASKS = [
  // Morning
  { id: 'medikamente', title: 'Medikamente nehmen',       icon: '💊', time: 'morning', schedule: 'daily' },
  { id: 'dehnen-mo',   title: 'Dehnen (Ellbogen & Knie)', icon: '🤸', time: 'morning', schedule: 'daily' },
  { id: 'zaehne-mo',   title: 'Zähne putzen',             icon: '🦷', time: 'morning', schedule: 'daily' },
  // Evening
  { id: 'meditation',  title: '5 Min meditieren',         icon: '🧘', time: 'evening', schedule: 'daily' },
  { id: 'dehnen-ev',   title: 'Dehnen (Ellbogen & Knie)', icon: '🤸', time: 'evening', schedule: 'daily' },
  { id: 'zaehne-ev',   title: 'Zähne putzen',             icon: '🦷', time: 'evening', schedule: 'daily' },
  { id: 'physio',      title: 'Physiotherapie-Übungen',   icon: '🏃', time: 'evening', schedule: 'every-other' },
]

// localStorage helpers
const STORAGE_KEY = 'daily-routine-v1'
const TODOS_KEY = 'daily-routine-todos-v1'

function loadStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getDayData(date) {
  const storage = loadStorage()
  const key = dateKey(date)
  const raw = storage[key] || {}
  return {
    completed: new Set(raw.completed || []),
    hidden: new Set(raw.hidden || []),
    custom: raw.custom || [],
  }
}

function setDayData(date, data) {
  const storage = loadStorage()
  const key = dateKey(date)
  storage[key] = {
    completed: [...data.completed],
    hidden: [...data.hidden],
    custom: data.custom,
  }
  saveStorage(storage)
}

export function toggleComplete(date, taskId) {
  const data = getDayData(date)
  if (data.completed.has(taskId)) data.completed.delete(taskId)
  else data.completed.add(taskId)
  setDayData(date, data)
}

export function hideTask(date, taskId) {
  const data = getDayData(date)
  data.hidden.add(taskId)
  setDayData(date, data)
}

export function addCustomTask(date, title, time, icon = '📝') {
  const data = getDayData(date)
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
  data.custom.push({ id, title, icon, time, schedule: 'daily' })
  setDayData(date, data)
  return id
}

export function removeCustomTask(date, taskId) {
  const data = getDayData(date)
  data.custom = data.custom.filter(t => t.id !== taskId)
  setDayData(date, data)
}

export function getTasksForDay(date) {
  const data = getDayData(date)
  const allTasks = [
    ...DEFAULT_TASKS.filter(t => taskAppliesToDate(t, date) && !data.hidden.has(t.id)),
    ...data.custom,
  ]
  return {
    morning: allTasks.filter(t => t.time === 'morning').map(t => ({
      ...t,
      completed: data.completed.has(t.id),
      isCustom: t.id.startsWith('custom-'),
    })),
    evening: allTasks.filter(t => t.time === 'evening').map(t => ({
      ...t,
      completed: data.completed.has(t.id),
      isCustom: t.id.startsWith('custom-'),
    })),
  }
}

// Returns true if ALL tasks for that date were completed
export function isDayComplete(date) {
  const tasks = getTasksForDay(date)
  const all = [...tasks.morning, ...tasks.evening]
  return all.length > 0 && all.every(t => t.completed)
}

// Calculate current streak (consecutive completed days up to and including today or yesterday)
export function calcStreak() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const cursor = new Date(today)

  // If today isn't done yet, start counting from yesterday
  if (!isDayComplete(cursor)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (isDayComplete(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
    if (streak > 365) break // safety cap
  }
  return streak
}

// Last 28 days for the heatmap
export function getLast28Days() {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({ date: new Date(d), complete: isDayComplete(d) })
  }
  return days
}

// ─── General Todos ────────────────────────────
export function loadGeneralTodos() {
  try { return JSON.parse(localStorage.getItem(TODOS_KEY) || '[]') } catch { return [] }
}

export function saveGeneralTodos(todos) {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
}
