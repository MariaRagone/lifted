import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../library/firebase';
import { format, parseISO } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import './DailyDevotional.css';

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
  profilePicUrl: string;
  uid: string;
}

const DailyDevotionalPage = () => {
   const [note, setNote] = useState('');
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [checkboxes, setCheckboxes] = useState<Checkboxes>({
    prayerDone: false,
    videoDone: false,
    otherFitnessDone: false,
    otherFitnessNote: '',
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userStatuses, setUserStatuses] = useState<
    { profile: UserProfile; completed: boolean }[]
  >([]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'days', todayStr);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDayData(docSnap.data() as DayData);
      }
    };
    fetchData();
  }, [todayStr]);

  useEffect(() => {
    const loadCheckboxes = async () => {
      if (!currentUser) return;
      const ref = doc(db, 'days', todayStr, 'checkboxes', currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCheckboxes(snap.data() as Checkboxes);
      }
    };
    loadCheckboxes();
  }, [currentUser, todayStr]);

  const saveToFirestore = async (updated: Partial<Checkboxes>) => {
    if (!currentUser) return;
    const ref = doc(db, 'days', todayStr, 'checkboxes', currentUser.uid);
    await setDoc(ref, { ...checkboxes, ...updated }, { merge: true });
  };

  const handleToggle = (key: keyof Checkboxes) => {
    const updated = { ...checkboxes, [key]: !checkboxes[key] };
    setCheckboxes(updated);
    saveToFirestore(updated);
  };

  const handleOtherFitnessNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const note = e.target.value;
    const updated = { ...checkboxes, otherFitnessNote: note };
    setCheckboxes(updated);
    saveToFirestore({ otherFitnessNote: note });
  };

  // 🟢 Load and display user statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const result: { profile: UserProfile; completed: boolean }[] = [];

      for (const userDoc of usersSnap.docs) {
        const profile = userDoc.data() as UserProfile;
        const userId = userDoc.id;

        const checkboxSnap = await getDoc(
          doc(db, 'days', todayStr, 'checkboxes', userId)
        );

        if (checkboxSnap.exists()) {
          const check = checkboxSnap.data() as Checkboxes;
          const completed =
            check.prayerDone && (check.videoDone || check.otherFitnessDone);

          result.push({ profile: { ...profile, uid: userId }, completed });
        } else {
          result.push({ profile: { ...profile, uid: userId }, completed: false });
        }
      }

      setUserStatuses(result);
    };

    fetchStatuses();
  }, [todayStr]);

  if (!dayData) return <div>Loading...</div>;

  const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const noteText = e.target.value;
  setNote(noteText);

  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid, "dailyNotes", todayStr);
  await setDoc(ref, { text: noteText, timestamp: new Date() }, { merge: true });
};

  return (
    <div className='page'>
      <h2>Daily Lift for {format(parseISO(todayStr), 'MMMM d')}</h2>

      <div className="section-header">
        <input
          type="checkbox"
          className="themed-checkbox"
          checked={checkboxes.prayerDone}
          onChange={() => handleToggle('prayerDone')}
        />
        <h3>🙏 Prayer</h3>
      </div>
      <p>{dayData.verse}</p>
      <hr />

      {dayData.isFitnessDay && dayData.videoUrl && (
        <>
          <div className="section-header">
            <input
              type="checkbox"
              className="themed-checkbox"
              checked={checkboxes.videoDone}
              onChange={() => handleToggle('videoDone')}
            />
            <h3>🏅 Fitness Challenge</h3>
          </div>

          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={dayData.videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            ></iframe>
          </div>
          <hr />

          <div className="section-header">
            <input
              type="checkbox"
              className="themed-checkbox"
              checked={checkboxes.otherFitnessDone}
              onChange={() => handleToggle('otherFitnessDone')}
            />
            <h3>📝 Custom Workout</h3>
          </div>
          <input
            type="text"
            placeholder="🏃 Custom workout..."
            value={checkboxes.otherFitnessNote}
            onChange={handleOtherFitnessNoteChange}
            className="input"
          />
          <hr />
        </>
      )}

        <h3>📝 Notes</h3>
        <textarea
          className="input"
          placeholder="Private notes go here!"
          value={note}
          onChange={handleNoteChange}
          rows={3}
/>

      {!dayData.isFitnessDay && (
        <>
          <h3>🧘‍♀️ Rest Day</h3>
          <p>Use today to reflect, stretch, or rest. You’ve earned it!</p>
          <hr />
        </>
      )}

<div className="community-checkins">
  {userStatuses.map(({ profile, completed }) => (
    <div key={profile.uid} className="user-checkin">
      {profile.profilePicUrl ? (
  <img src={profile.profilePicUrl} alt={profile.displayName} />
) : (
  <div className="avatar-fallback">
    {profile.displayName?.charAt(0).toUpperCase() || "?"}
  </div>
)}
      <div>
        {completed ? '✅' : '❌'}
      </div>
    </div>
  ))}


        <p style={{textAlign: 'center', color: '#f1a84d', paddingBottom: '30px', }}>Lift up your friends in prayer and encourage them to do their daily lift!</p>
      </div>
    </div>
  );
};

export default DailyDevotionalPage;
