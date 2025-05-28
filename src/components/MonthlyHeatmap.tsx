import React from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay
} from 'date-fns'
import './MonthlyHeatmap.css'

type Props = {
  completedDates: Set<string>
}

export default function MonthlyHeatmap({ completedDates }: Props) {
  const today = new Date()
  const start = startOfMonth(today)
  const end = endOfMonth(today)
  const daysInMonth = eachDayOfInterval({ start, end })

  const weeks: (Date | null)[][] = []
  let currentWeek: (Date | null)[] = []

  for (let i = 0; i < getDay(start); i++) {
    currentWeek.push(null)
  }

  daysInMonth.forEach((d) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(d)
  })

  while (currentWeek.length < 7) {
    currentWeek.push(null)
  }
  weeks.push(currentWeek)

  return (
    <div className="monthly-heatmap">
      <h2 className="mh-title">{format(today, 'MMMM yyyy')}</h2>

      <div className="mh-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
          <div key={wd} className="mh-weekday">{wd}</div>
        ))}
      </div>

      <div className="mh-grid">
        {weeks.flat().map((d, idx) => {
          if (!d) {
            return <div key={idx} className="mh-day empty" />
          }
          const dateStr = format(d, 'yyyy-MM-dd')
          const isDone = completedDates.has(dateStr)
          return (
            <div
              key={idx}
              className={`mh-day ${isDone ? 'done' : 'not-done'}`}
              title={format(d, 'MMM d, yyyy')}
            >
              <span className="mh-day-label">{format(d, 'd')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
