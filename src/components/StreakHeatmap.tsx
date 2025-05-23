import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays, format } from 'date-fns';

interface StreakHeatmapProps {
  completedDates: string[];
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ completedDates }) => {
  const endDate = new Date();
  const startDate = subDays(endDate, 180); // last 6 months

  const values = Array.from({ length: 181 }).map((_, i) => {
    const date = subDays(endDate, 180 - i);
    const dateString = format(date, 'yyyy-MM-dd');

    return {
      date: dateString,
      count: completedDates.includes(dateString) ? 1 : 0,
    };
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📅 Activity Heatmap</h3>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value: { count: number; }) => {
          if (!value || value.count === 0) {
            return 'color-empty';
          }
          return `color-filled`;
        }}
        tooltipDataAttrs={(value: any) => {
          return {
            'data-tip': value.date ? `Completed on ${value.date}` : 'No activity',
          };
        }}
        showWeekdayLabels
      />
    </div>
  );
};

export default StreakHeatmap;
