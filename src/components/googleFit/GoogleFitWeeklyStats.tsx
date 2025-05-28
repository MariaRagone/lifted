// src/components/WeeklyFitStats.tsx
import React, { useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { fetchGoogleFitData } from '../../library/GoogleFitHelpers'

interface DailyData {
  date: string
  steps: number
  heartPoints: number
}

export default function WeeklyFitStats() {
  const [weekData, setWeekData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, i)
      return {
        iso: format(d, 'yyyy-MM-dd'),
        label: format(d, 'EEE')  // Mon, Tue, Wed…
      }
    }).reverse()

    async function load() {
      const results: DailyData[] = []
      for (let { iso, label } of dates) {
        const { steps, heartPoints } = await fetchGoogleFitData(iso)
        results.push({ date: label, steps, heartPoints })
      }
      setWeekData(results)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p>Loading weekly stats…</p>

  const totalSteps = weekData.reduce((sum, d) => sum + d.steps, 0)
  const totalHP = weekData.reduce((sum, d) => sum + d.heartPoints, 0)

  return (
    <div className="weekly-fit-stats section-box">
      <h2 className="section-title">🏃 Weekly Google Fit</h2>
      <table className="weekly-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>🚶 Steps</th>
            <th>❤️ Heart Points</th>
          </tr>
        </thead>
        <tbody>
          {weekData.map(({ date, steps, heartPoints }) => (
            <tr key={date}>
              <td>{date}</td>
              <td>{steps.toLocaleString()}</td>
              <td>{heartPoints}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{totalSteps.toLocaleString()}</strong></td>
            <td><strong>{totalHP}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
