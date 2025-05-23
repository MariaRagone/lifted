import React from 'react';
import { format, subDays, getDay } from 'date-fns';
import './StreakHeatmap.css';

type Props = {
  completedDates: Set<string>;
};

export default function StreakHeatmap({ completedDates }: Props) {
  const days: { date: string; completed: boolean }[] = [];

  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    days.unshift({
      date: dateStr,
      completed: completedDates.has(dateStr),
    });
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="heatmap-container">
      <h2 className="heatmap-title">🗓️ Activity Calendar</h2>
      <div className="heatmap-weekdays">
        {weekdays.map((day, idx) => (
          <div key={idx} className="heatmap-weekday">{day}</div>
        ))}
      </div>
      <div className="heatmap-grid">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`heatmap-day ${day.completed ? 'completed' : ''}`}
            title={day.date}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <div className="heatmap-legend-item">
          <span className="heatmap-day" /> Not Done
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-day completed" /> Done
        </div>
      </div>
    </div>
  );
}
