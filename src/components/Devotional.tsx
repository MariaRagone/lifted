import React, { useEffect, useState } from 'react';
import './Devotional.css';
import devos from '../data/daily-lift-devotionals.json';

interface DevotionalEntry {
  id: number;
  date: string; // 'YYYY-MM-DD'
  verse: string;
  devotional: string;
  reflection: string;
}

const DailyDevotional: React.FC = () => {
  const [todayDevo, setTodayDevo] = useState<DevotionalEntry | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // e.g., '2025-05-23'
    const match = (devos as DevotionalEntry[]).find((d) => d.date === today);
    setTodayDevo(match || null);
  }, []);

  return (
    <div className="devotional-section">
      <h2>Today's Devotional</h2>
      {todayDevo ? (
        <>
          <div className="devotional-verse">📖 {todayDevo.verse}</div>
          <div className="devotional-text">{todayDevo.devotional}</div>
          <div className="devotional-reflection">
            <strong>Reflection:</strong> {todayDevo.reflection}
          </div>
        </>
      ) : (
        <p className="devotional-text">No devotional found for today.</p>
      )}
    </div>
  );
};

export default DailyDevotional;
