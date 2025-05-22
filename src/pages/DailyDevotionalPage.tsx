import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  workoutDone: boolean;
  otherFitnessDone: boolean;
  otherFitnessNote?: string;
}

const DailyDevotionalPage = () => {
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [checkboxes, setCheckboxes] = useState<Checkboxes>({
    prayerDone: false,
    workoutDone: false,
    otherFitnessDone: false,
    otherFitnessNote: '',
  });

  const [note, setNote] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
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
      } else {
        console.warn('No devotional found for today.');
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

  useEffect(() => {
  const fetchNote = async () => {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid, "dailyNotes", todayStr);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setNote(data.text || '');
    }
  };

  fetchNote();
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

const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const noteText = e.target.value;
  setNote(noteText);

  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid, "dailyNotes", todayStr);
  await setDoc(ref, { text: noteText, timestamp: new Date() }, { merge: true });
};


  if (!dayData) return <div>Loading...</div>;

  return (
    <div style={{ padding: '1rem' }}>
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
              checked={checkboxes.workoutDone}
              onChange={() => handleToggle('workoutDone')}
            />
            <h3>🏋️ Lift</h3>
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
            <h3>📋 Custom Workout</h3>
          </div>

          <input
            className="input"
            type="text"
            placeholder="🏃 Custom workout..."
            value={checkboxes.otherFitnessNote}
            onChange={handleOtherFitnessNoteChange}
          />
          <hr />
        </>
      )}

      <h3>📖 Notes</h3>
        <textarea
          className="input"
          placeholder="Private notes go here!"
          value={note}
          onChange={handleNoteChange}
          rows={3}
/>

      <hr />

      {!dayData.isFitnessDay && (
        <>
          <h3>🧘‍♀️ Rest Day</h3>
          <p>Use today to reflect, stretch, or rest. You’ve earned it!</p>
        </>
      )}
    </div>
  );
};

export default DailyDevotionalPage;
