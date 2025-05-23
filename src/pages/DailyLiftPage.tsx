import React, { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format, addDays } from 'date-fns';
import { db, auth } from '../library/firebase';
import ScrollingDates from '../components/ScrollingDates';
import './DailyLift.css';
import { generateDateRange } from '../utilities/dateHelpers';
import { getInitials } from '../utilities/userHelpers';
import WorkoutVideos from '../components/WorkoutVideos';
import Devotional from '../components/Devotional';

interface DayData {
  verse: string;
  isFitnessDay: boolean;
  funnyInspiration: string;
}

interface Checkboxes {
  prayerDone: boolean;
  videoDone: boolean;
  otherFitnessDone: boolean;
  otherFitnessNote?: string;
}

interface UserStatus {
  uid: string;
  profilePicUrl?: string;
  displayName?: string;
  completed: boolean;
}

const DEFAULT_CHECKBOXES: Checkboxes = {
  prayerDone: false,
  videoDone: false,
  otherFitnessDone: false,
  otherFitnessNote: '',
};

const DailyLiftPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [checkboxes, setCheckboxes] = useState<Checkboxes>(DEFAULT_CHECKBOXES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const allDates = generateDateRange(-30, 5);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setCheckboxes(DEFAULT_CHECKBOXES);
    setUserStatuses([]);
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'days', selectedDate));
      if (snap.exists()) setDayData(snap.data() as DayData);
      else {
        setDayData(null);
        console.warn('No devotional for', selectedDate);
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    if (!currentUser) {
      setCompletedDates(new Set());
      return;
    }
    (async () => {
      const doneSet = new Set<string>();
      for (let offset = -30; offset <= 5; offset++) {
        const d = format(addDays(new Date(selectedDate), offset), 'yyyy-MM-dd');
        const [cbSnap, daySnap] = await Promise.all([
          getDoc(doc(db, 'days', d, 'checkboxes', currentUser.uid)),
          getDoc(doc(db, 'days', d)),
        ]);
        if (!cbSnap.exists() || !daySnap.exists()) continue;
        const cb = cbSnap.data() as Checkboxes;
        const day = daySnap.data() as DayData;
        const completed = cb.prayerDone && (day.isFitnessDay ? (cb.videoDone || cb.otherFitnessDone) : true);
        if (completed) doneSet.add(d);
      }
      setCompletedDates(doneSet);
    })();
  }, [currentUser, selectedDate]);

  useEffect(() => {
    if (!currentUser || !dayData) return;
    (async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const out: UserStatus[] = [];
      for (const uDoc of usersSnap.docs) {
        const uid = uDoc.id;
        const profile = uDoc.data() as { profilePicUrl?: string; displayName?: string };
        const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', uid));
        const cb = cbSnap.exists() ? (cbSnap.data() as Checkboxes) : DEFAULT_CHECKBOXES;
        const completed = cb.prayerDone && (dayData.isFitnessDay ? (cb.videoDone || cb.otherFitnessDone) : true);
        out.push({ uid, profilePicUrl: profile.profilePicUrl, displayName: profile.displayName, completed });
      }
      setUserStatuses(out);
    })();
  }, [currentUser, selectedDate, dayData]);

  const saveCheckboxes = async (partial: Partial<Checkboxes>) => {
    if (!currentUser) return;
    const updated = { ...checkboxes, ...partial };
    setCheckboxes(updated);
    await setDoc(doc(db, 'days', selectedDate, 'checkboxes', currentUser.uid), updated, { merge: true });
  };

  if (!dayData) return <div style={{ padding: '1rem' }}>Loading…</div>;

  return (
    <div className="daily-page">
      <ScrollingDates
        dates={allDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedDates={completedDates}
      />

      <div className="section-header">
        <input
          className="checkboxes"
          type="checkbox"
          checked={checkboxes.prayerDone}
          onChange={() => saveCheckboxes({ prayerDone: !checkboxes.prayerDone })}
        />
        <h3>🙏 Prayer</h3>
      </div>
      <Devotional />
      {dayData.isFitnessDay && (
        <>
          <div className="section-header">
            <input
              className="checkboxes"
              type="checkbox"
              checked={checkboxes.videoDone}
              onChange={() => saveCheckboxes({ videoDone: !checkboxes.videoDone })}
            />
            <h3>🏅 Fitness Challenge</h3>
          </div>

          <WorkoutVideos />
          <hr />
          <div className="section-header">
            <input
              className="checkboxes"
              type="checkbox"
              checked={checkboxes.otherFitnessDone}
              onChange={() => saveCheckboxes({ otherFitnessDone: !checkboxes.otherFitnessDone })}
            />
            <h3>📝 Custom Workout</h3>
          </div>
          <input
            type="text"
            className="input"
            placeholder="🏃 Custom workout..."
            value={checkboxes.otherFitnessNote || ''}
            onChange={(e) => saveCheckboxes({ otherFitnessNote: e.target.value })}
          />
          <p>{dayData.funnyInspiration}</p>
          <hr />
        </>
      )}

      {!dayData.isFitnessDay && (
        <>
          <h3>🧘‍♀️ Rest Day</h3>
          <p>Use today to reflect, stretch, or rest—you’ve earned it!</p>
          <hr />
        </>
      )}

      <h3>💛 Lift Circle</h3>
      <div className="community-checkins">
        {userStatuses.map(({ uid, profilePicUrl, displayName, completed }) => (
          <div key={uid} className="user-checkin">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={displayName ?? 'User'} />
            ) : (
              <div className="avatar-fallback">{getInitials(displayName)}</div>
            )}
            {completed && <span className="checkmark">✓</span>}
          </div>
        ))}
      </div>
      <p className="encourage">
        Lift up your friends in prayer and encourage them to do their daily lift!
      </p>
    </div>
  );
};

export default DailyLiftPage;
