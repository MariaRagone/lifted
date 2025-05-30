import React from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import {  FaPrayingHands, FaMedal } from 'react-icons/fa'
import './MonthlyHeatmap.css'

type Props = {
  viewDate: Date;
  completedDates: Set<string>;
  prayerDates:    Set<string>;
  fitnessDates:   Set<string>;
}

export default function MonthlyHeatmap({ viewDate, completedDates, prayerDates, fitnessDates }: Props) {
  const today = new Date()
  const start = startOfMonth(viewDate)
  const end = endOfMonth(viewDate)
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
      <h2 className="mh-title">{format(viewDate, 'MMMM yyyy')}</h2>
      <div className="mh-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((wd) => (
          <div key={wd} className="mh-weekday">{wd}</div>
        ))}
      </div>
      <div className="mh-grid">
        {weeks.flat().map((d, idx) => {
          if (!d) return <div key={idx} className="mh-day empty" />
          const dateStr = format(d, 'yyyy-MM-dd')
          const isDone    = completedDates.has(dateStr)
          const didPrayer = prayerDates.has(dateStr)
          const didFit    = fitnessDates.has(dateStr)
          return (
            
            <div
              key={idx}
              className={`mh-day ${isDone ? 'done' : 'not-done'}`}
              title={format(d, 'MMM d, yyyy')}
            >
              <span className="mh-day-label">{format(d, 'd')}</span>
              {didPrayer && (
                <span className="mh-icon prayer" aria-label="prayer done">
                  🙏
                </span>
              )}
              {didFit && (
                <span className="mh-icon fitness" aria-label="fitness done">
                  🏅
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className="mh-legend">
        <div className="mh-legend-item">
          <span className="mh-legend-box done" />
          <span>Day Complete</span>
        </div>
        <div className="mh-legend-item">
          <span>🙏 Prayer Complete</span>
        </div>
        <div className="mh-legend-item">
          <span>🏅 Fitness Complete</span>
        </div>
      </div>
    </div>
  )
}
