import React from 'react';
dimport { format, subDays } from 'date-fns';

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
    <div className="daily-streak">
      <h3>🔥 Past 30 Days</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyStreak;
