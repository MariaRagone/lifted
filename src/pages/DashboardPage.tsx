import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../library/firebase';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import logo from '../assets/daily-lift-logo.png';
import DailyStreak from '../components/DailyStreak';
import { calculateStreak } from '../utilities/dailyStreakHelpers';
import StreakHeatmap from '../components/StreakHeatmap';


export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        const data = userDoc.data();

        setUserName(data?.displayName || user.email || 'User');

        const today = new Date();
        const doneDates: string[] = [];

        for (let offset = -59; offset <= 0; offset++) {
          const dateStr = format(subDays(today, -offset), 'yyyy-MM-dd');
          const cbSnap = await getDoc(doc(db, 'days', dateStr, 'checkboxes', uid));
          const daySnap = await getDoc(doc(db, 'days', dateStr));

          if (!cbSnap.exists() || !daySnap.exists()) continue;

          const cb = cbSnap.data();
          const dayData = daySnap.data();
          const isFitnessDay = dayData?.isFitnessDay ?? true;

          const isCompleted = cb.prayerDone && (isFitnessDay ? (cb.videoDone || cb.otherFitnessDone) : true);
          if (isCompleted) doneDates.push(dateStr);
        }

        setCompletedDates(doneDates);
        setStreakCount(calculateStreak(new Set(doneDates), format(today, 'yyyy-MM-dd')));
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome, {userName}!</h2>
      <img className="logo" src={logo} alt="Lift & Lifted Logo" style={{ maxWidth: '200px', marginBottom: '1rem' }} />

      <div>
        <h3>Your Current Streak: {streakCount} {streakCount === 1 ? 'day' : 'days'}</h3>
      </div>

        <DailyStreak completedDates={completedDates} />
        <StreakHeatmap completedDates={completedDates} />
      <button onClick={handleLogout} style={{ marginTop: '2rem' }}>Log Out</button>
    </div>
  );
}
