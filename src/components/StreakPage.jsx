import { useMemo } from 'react'
import { calcStreak, getLast28Days, WEEKDAYS } from '../tasks.js'

const MILESTONES = [3, 7, 14, 21, 30, 60, 100]

function getMilestoneReward(streak) {
  if (streak >= 100) return { emoji: '🏆', label: 'Legende', color: '#FF9500' }
  if (streak >= 60)  return { emoji: '💎', label: 'Diamant',  color: '#5856D6' }
  if (streak >= 30)  return { emoji: '🥇', label: 'Gold',     color: '#FFD700' }
  if (streak >= 21)  return { emoji: '🥈', label: 'Silber',   color: '#8E8E93' }
  if (streak >= 14)  return { emoji: '🌟', label: '2 Wochen', color: '#FF9500' }
  if (streak >= 7)   return { emoji: '🔥', label: '1 Woche',  color: '#FF3B30' }
  if (streak >= 3)   return { emoji: '⚡', label: '3 Tage',   color: '#007AFF' }
  return { emoji: '🌱', label: 'Beginner', color: '#34C759' }
}

function getNextMilestone(streak) {
  return MILESTONES.find(m => m > streak) ?? null
}

export default function StreakPage() {
  const streak = useMemo(() => calcStreak(), [])
  const days = useMemo(() => getLast28Days(), [])
  const reward = getMilestoneReward(streak)
  const nextMilestone = getNextMilestone(streak)
  const completedTotal = days.filter(d => d.complete).length

  return (
    <div className="streak-page">
      {/* Hero */}
      <div className="streak-hero">
        <div className="streak-badge" style={{ borderColor: reward.color }}>
          <span className="streak-emoji">{reward.emoji}</span>
          <span className="streak-number">{streak}</span>
          <span className="streak-unit">Tage</span>
        </div>
        <p className="streak-label" style={{ color: reward.color }}>{reward.label}</p>

        {nextMilestone && (
          <div className="streak-next">
            <div className="streak-next-bar-bg">
              <div
                className="streak-next-bar-fill"
                style={{
                  width: `${(streak / nextMilestone) * 100}%`,
                  background: reward.color,
                }}
              />
            </div>
            <p className="streak-next-label">
              Noch {nextMilestone - streak} Tag{nextMilestone - streak !== 1 ? 'e' : ''} bis zum nächsten Level
            </p>
          </div>
        )}

        {streak === 0 && (
          <p className="streak-zero-hint">Erledige heute alle Tasks, um deinen Streak zu starten!</p>
        )}
      </div>

      {/* Milestones */}
      <div className="card">
        <h3 className="card-title">Meilensteine</h3>
        <div className="milestones">
          {MILESTONES.map(m => {
            const reached = streak >= m
            const info = getMilestoneReward(m)
            return (
              <div key={m} className={`milestone ${reached ? 'reached' : ''}`}>
                <span className="milestone-emoji">{info.emoji}</span>
                <span className="milestone-days">{m}d</span>
                {reached && <div className="milestone-check">✓</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 28-day heatmap */}
      <div className="card">
        <div className="card-title-row">
          <h3 className="card-title">Letzte 28 Tage</h3>
          <span className="heatmap-stat">{completedTotal}/28 vollständig</span>
        </div>
        <div className="heatmap">
          {/* Weekday headers */}
          {WEEKDAYS.map(d => (
            <div key={d} className="heatmap-header">{d}</div>
          ))}
          {/* Offset for first day of week */}
          {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="heatmap-cell empty" />
          ))}
          {days.map(({ date, complete }) => {
            const isToday = new Date().toDateString() === date.toDateString()
            return (
              <div
                key={date.toISOString()}
                className={`heatmap-cell ${complete ? 'complete' : 'incomplete'} ${isToday ? 'today' : ''}`}
                title={date.toLocaleDateString('de-DE')}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
