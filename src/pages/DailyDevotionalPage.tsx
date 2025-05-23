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
import { format, parseISO } from 'date-fns';
import { db, auth } from '../library/firebase';
import ScrollingDates from '../components/ScrollingDates';
import logo from '../assets/daily-lift-logo.png';
import './DailyDevotional.css';
import { generateLastNDates, generateDateRange } from '../utilities/dateHelpers'
interface DayData {
  verse: string;
  videoUrl?: string;
  isFitnessDay: boolean;
}

interface Checkboxes {
  prayerDone: boolean;
  videoDone: boolean;
  otherFitnessDone: boolean;
  otherFitnessNote?: string;
}

interface UserProfile {
  displayName: string;
  profilePicUrl?: string;
}

interface UserStatus {
  uid: string;
  profilePicUrl?: string;
  completed: boolean;
}

const DEFAULT_CHECKBOXES: Checkboxes = {
  prayerDone: false,
  videoDone: false,
  otherFitnessDone: false,
  otherFitnessNote: '',
};

const DailyDevotionalPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [checkboxes, setCheckboxes] = useState<Checkboxes>(
    DEFAULT_CHECKBOXES
  );
  const [note, setNote] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const allDates = generateDateRange(-30, 5);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    setCheckboxes(DEFAULT_CHECKBOXES);
    setNote('');
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
      const snap = await getDoc(
        doc(
          db,
          'days',
          selectedDate,
          'checkboxes',
          currentUser.uid
        )
      );
      if (snap.exists()) {
        setCheckboxes(snap.data() as Checkboxes);
      }
    };
    loadMine();
  }, [currentUser, selectedDate]);

  useEffect(() => {
    const loadAll = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const out: UserStatus[] = [];

      for (const uDoc of usersSnap.docs) {
        const uid = uDoc.id;
        const profile = uDoc.data() as UserProfile;
        const cbSnap = await getDoc(
          doc(db, 'days', selectedDate, 'checkboxes', uid)
        );
        const data = cbSnap.exists()
          ? (cbSnap.data() as Checkboxes)
          : DEFAULT_CHECKBOXES;
        const completed =
          data.prayerDone &&
          (data.videoDone || data.otherFitnessDone);
        out.push({ uid, profilePicUrl: profile.profilePicUrl, completed });
      }
      setUserStatuses(out);
    };
    loadAll();
  }, [selectedDate]);

  const saveCheckboxes = async (
    partial: Partial<Checkboxes>
  ) => {
    if (!currentUser) return;
    const ref = doc(
      db,
      'days',
      selectedDate,
      'checkboxes',
      currentUser.uid
    );
    const updated = { ...checkboxes, ...partial };
    setCheckboxes(updated);
    await setDoc(ref, updated, { merge: true });
  };

  const saveNote = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    setNote(text);
    if (!currentUser) return;
    const ref = doc(
      db,
      'users',
      currentUser.uid,
      'dailyNotes',
      selectedDate
    );
    await setDoc(
      ref,
      { text, timestamp: new Date().toISOString() },
      { merge: true }
    );
  };

  if (!dayData)
    return <div style={{ padding: '1rem' }}>Loading…</div>;

  return (
    <div className="daily-page">
      <img className="logo" src={logo} alt="Daily Lift" />

      <ScrollingDates
        dates={allDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="section-header">
        <input
          className='checkboxes'
          type="checkbox"
          checked={checkboxes.prayerDone}
          onChange={() => saveCheckboxes({ prayerDone: !checkboxes.prayerDone })}
        />
        <h3>🙏 Prayer</h3>
      </div>
      <p>{dayData.verse}</p>
      <hr />

      {dayData.isFitnessDay && dayData.videoUrl && (
        <>
          <div className="section-header">
            <input
              className='checkboxes'
              type="checkbox"
              checked={checkboxes.videoDone}
              onChange={() => saveCheckboxes({ videoDone: !checkboxes.videoDone })}
            />
            <h3>🏅 Fitness Challenge</h3>
          </div>
          <div className="video-wrap">
            <iframe
              src={dayData.videoUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
          <hr />

          <div className="section-header">
            <input
              className='checkboxes'
              type="checkbox"
              checked={checkboxes.otherFitnessDone}
              onChange={() =>
                saveCheckboxes({
                  otherFitnessDone: !checkboxes.otherFitnessDone,
                })
              }
            />
            <h3>📝 Custom Workout</h3>
          </div>
          <input
            type="text"
            className="input"
            placeholder="🏃 Custom workout..."
            value={checkboxes.otherFitnessNote}
            onChange={(e) =>
              saveCheckboxes({ otherFitnessNote: e.target.value })
            }
          />
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
        {userStatuses.map(({ uid, profilePicUrl, completed }) => (
          <div key={uid} className="user-checkin">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="" />
            ) : (
              <div className="avatar-fallback">?</div>
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
