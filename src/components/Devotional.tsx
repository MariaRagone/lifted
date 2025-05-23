import React, { useEffect, useState } from 'react';
import './Devotional.css';
import devos from '../data/daily-lift-devotionals.json';

interface DevotionalEntry {
  id: number;
  date: string;
  verse: string;
  devotional: string;
  reflection: string;
}

interface Props {
  selectedDate: string; // expected format: 'YYYY-MM-DD'
}

const DailyDevotional: React.FC<Props> = ({ selectedDate }) => {
  const [todayDevo, setTodayDevo] = useState<DevotionalEntry | null>(null);

  useEffect(() => {
    const match = devos.find((d) => d.date === selectedDate);
    setTodayDevo(match || null);
  }, [selectedDate]);

  return (
    <div className="devotional-section">
      {todayDevo ? (
        <>
          <div className="devotional-verse">📖 {todayDevo.verse}</div>
          <div className="devotional-text">{todayDevo.devotional}</div>
          <div className="devotional-reflection">
            <strong>Reflection:</strong> {todayDevo.reflection}
          </div>
        </>
      ) : (
        <p className="devotional-text">No devotional found for {selectedDate}.</p>
      )}
    </div>
  );
};

export default DailyDevotional;
