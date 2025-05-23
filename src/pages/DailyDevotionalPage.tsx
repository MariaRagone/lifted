// src/pages/DailyDevotionalPage.tsx
import React, { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format, parseISO, addDays } from 'date-fns';
import { db, auth } from '../library/firebase';
import ScrollingDates from '../components/ScrollingDates';
import logo from '../assets/daily-lift-logo.png';
import './DailyDevotional.css';
import { generateDateRange } from '../utilities/dateHelpers';
import { getInitials } from '../utilities/userHelpers';

getInitials()

interface DayData {
  verse: string;
  videoUrl?: string;
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

const DailyDevotionalPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [checkboxes, setCheckboxes] = useState<Checkboxes>(DEFAULT_CHECKBOXES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const allDates = generateDateRange(-30, 5);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    setCheckboxes(DEFAULT_CHECKBOXES);
    setUserStatuses([]);
  }, [selectedDate]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'days', selectedDate));
      if (snap.exists()) {
        setDayData(snap.data() as DayData);
      } else {
        setDayData(null);
        console.warn('No devotional for', selectedDate);
      }
    };
    load();
  }, [selectedDate]);

  useEffect(() => {
    if (!currentUser) return;
    const loadMine = async () => {
      const snap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', currentUser.uid));
      if (snap.exists()) {
        setCheckboxes(snap.data() as Checkboxes);
      }
    };
    loadMine();
  }, [currentUser, selectedDate]);

  useEffect(() => {
    (async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const out: UserStatus[] = [];
      for (const uDoc of usersSnap.docs) {
        const uid = uDoc.id;
        const profile = uDoc.data() as { profilePicUrl?: string; displayName?: string };
        const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', uid));
        const cb = cbSnap.exists() ? (cbSnap.data() as Checkboxes) : DEFAULT_CHECKBOXES;
        const isFitnessDay = dayData?.isFitnessDay ?? true;
        const completed = cb.prayerDone && (isFitnessDay ? (cb.videoDone || cb.otherFitnessDone) : true);
        out.push({ uid, profilePicUrl: profile.profilePicUrl, displayName: profile.displayName, completed });
      }
      setUserStatuses(out);
    })();
  }, [selectedDate, dayData]);

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

        const isCompleted = cb.prayerDone && (day.isFitnessDay ? (cb.videoDone || cb.otherFitnessDone) : true);
        if (isCompleted) {
          doneSet.add(d);
        }
      }
      setCompletedDates(doneSet);
    })();
  }, [currentUser, selectedDate]);

  const saveCheckboxes = async (partial: Partial<Checkboxes>) => {
    if (!currentUser) return;
    const updated = { ...checkboxes, ...partial };
    setCheckboxes(updated);
    await setDoc(doc(db, 'days', selectedDate, 'checkboxes', currentUser.uid), updated, { merge: true });
  };



  if (!dayData) return <div style={{ padding: '1rem' }}>Loading…</div>;

  return (
    <div className="daily-page">
      <img className="logo" src={logo} alt="Daily Lift" />

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
      <h4>{dayData.verse}</h4>
      <hr />

      {dayData.isFitnessDay && dayData.videoUrl && (
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
          <div>
            <iframe
              className="video"
              src={dayData.videoUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
          <hr />

          <div className="section-header">
            <input
              className="checkboxes"
              type="checkbox"
              checked={checkboxes.otherFitnessDone}
              onChange={() => saveCheckboxes({ otherFitnessDone: !checkboxes.otherFitnessDone })}
            />
            <h3>📝 Custom Workout</h3>
            <br />
          </div>
          <input
            type="text"
            className="input"
            placeholder="🏃 Custom workout..."
            value={checkboxes.otherFitnessNote}
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
              <div
                className="avatar-fallback">
                {getInitials(displayName)}
              </div>
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

export default DailyDevotionalPage;
