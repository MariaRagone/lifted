import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../library/firebase';
import './StepCount.css';
import GoogleFitConnect from '../library/GoogleFitConnect';

interface StepCountProps {
  userId: string;
  selectedDate: string;
}

interface GoogleFitConnectProps {
  onStepsSaved?: (steps: number) => void;
}


const StepCount: React.FC<StepCountProps> = ({ userId, selectedDate }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', userId, 'steps', selectedDate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSteps(data.steps || 0);
      } else {
        setSteps(null);
      }
      setLoading(false);
    };

    fetchSteps();
  }, [userId, selectedDate]);

  if (loading) return null;

  return (
    <div className="step-card">
      {steps !== null ? (
        <div className="step-data">
          <h4>🚶 Steps</h4>
          <p>{steps.toLocaleString()}</p>
        </div>
      ) : (
<GoogleFitConnect onStepsSaved={(totalSteps) => setSteps(totalSteps)} />
      )}
    </div>
  );
};

export default StepCount;
