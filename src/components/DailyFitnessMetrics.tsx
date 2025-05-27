// components/FitnessMetrics.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../library/firebase';
import './DailyFitnessMetrics.css';

interface FitnessMetricsProps {
  userId: string;
  selectedDate: string;
}

const FitnessMetrics: React.FC<FitnessMetricsProps> = ({ userId, selectedDate }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [heartPoints, setHeartPoints] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'users', userId, 'steps', selectedDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setSteps(data.steps ?? null);
        setHeartPoints(data.heartPoints ?? null);
      }
    };
    fetchData();
  }, [userId, selectedDate]);

  if (steps === null && heartPoints === null) return null;

  return (
    <div className="fitness-card">
      {steps !== null && (
        <div className="fitness-row">
          <span className="icon">🚶</span>
          <span className="label">Steps</span>
          <span className="value">{steps.toLocaleString()}</span>
        </div>
      )}
      {heartPoints !== null && (
        <div className="fitness-row">
          <span className="icon">❤️</span>
          <span className="label">Heart Points</span>
          <span className="value">{Math.round(heartPoints)}</span>
        </div>
      )}
    </div>
  );
};

export default FitnessMetrics;
