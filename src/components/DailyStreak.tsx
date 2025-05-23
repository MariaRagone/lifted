import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subDays } from 'date-fns';

interface DailyStreakProps {
  completedDates: string[];
}

const DailyStreak: React.FC<DailyStreakProps> = ({ completedDates }) => {
  const today = new Date();
  const DAYS = 30;

  const data = Array.from({ length: DAYS }).map((_, i) => {
    const date = subDays(today, DAYS - 1 - i);
    const dateString = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'MM/dd'),
      completed: completedDates.includes(dateString) ? 1 : 0,
    };
  });

return (
    <div className='streak-container'>
      <h2 className='title'>📈 Daily Progress (Last 30 Days)</h2>
      <div className='chart-container'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick: string) => tick.slice(5)}
              interval={4}
              fontSize={10}
            />
            <YAxis allowDecimals={false} domain={[0, 1]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#00b894"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailyStreak;
