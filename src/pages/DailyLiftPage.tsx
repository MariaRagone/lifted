import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format, addDays } from 'date-fns';
import { db, auth } from '../library/firebase';
import ScrollingDates from '../components/ScrollingDates';
import './DailyLift.css';
import { generateDateRange, isFitnessDay } from '../utilities/dateHelpers';
import { getInitials } from '../utilities/userHelpers';
import WorkoutVideos from '../components/WorkoutVideos';
import Devotional from '../components/Devotional';
import Logo from '../components/Logo';
import GroupMembers from '../components/GroupMemembers';
import devos from '../data/daily-lift-devotionals.json';
import DeployToast from '../components/DeployToast';
import GoogleFitMetrics from '../components/googleFit/GoogleFitMetrics';

interface DevotionalEntry {
  id: number;
  date: string;
  verse: string;
  devotional: string;
  reflection: string;
  funnyInspiration?: string;
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
  const [checkboxes, setCheckboxes] = useState<Checkboxes>(DEFAULT_CHECKBOXES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [userGroupIds, setUserGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false);

const allDates = generateDateRange(-30, 5);
const showFitness = isFitnessDay(selectedDate);
const todayDevo = devos.find((d) => d.date === selectedDate) as DevotionalEntry | undefined;
useEffect(() => {
  if (!currentUser) return;
  const ref = doc(db, 'users', currentUser.uid);
  getDoc(ref).then(snap => {
    setGoogleFitAuthorized(snap.exists() && snap.data()?.googleFitAuthorized);
  });
}, [currentUser]);

  
useEffect(() => {
  if (!currentUser) return;

  const fetchSavedSteps = async () => {
    const stepDoc = await getDoc(doc(db, 'users', currentUser.uid, 'steps', selectedDate));
    if (stepDoc.exists()) {
      const data = stepDoc.data();
      setStepCount(data.steps || 0);
    } else {
      setStepCount(null); // no data yet
    }
  };

  fetchSavedSteps();
}, [currentUser, selectedDate]);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Force-fetch the user's Firestore document to ensure group data is available
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData) {
        const groups: string[] =
          userData.groupIds || (userData.groupId ? [userData.groupId] : []);
        setUserGroupIds(groups);
      }

      setCurrentUser(user);
      setLoading(false);
    } else {
      setCurrentUser(null);
      setUserGroupIds([]);
      setLoading(false);
    }
  });

  return unsubscribe;
}, []);


  useEffect(() => {
    if (!currentUser) {
      setUserGroupIds([]);
      return;
    }

    const fetchGroupIds = async () => {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const groups: string[] =
        userData?.groupIds || (userData?.groupId ? [userData.groupId] : []);
      setUserGroupIds(groups);
      setLoading(false);
    };

    fetchGroupIds();
  }, [currentUser]);

useEffect(() => {
  setUserStatuses([]);
}, [selectedDate]);


  useEffect(() => {
  if (!currentUser) {
    setUserGroupIds([]); 
    return;
  }

  const fetchGroupIds = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const groups: string[] =
      userData?.groupIds || (userData?.groupId ? [userData.groupId] : []);
    setUserGroupIds(groups);
    setLoading(false); // only set loading to false after this completes
  };

  fetchGroupIds();
}, [currentUser]);


  useEffect(() => {
    if (!currentUser) {
      setCompletedDates(new Set());
      return;
    }

    (async () => {
      const doneSet = new Set<string>();
      for (let offset = -30; offset <= 5; offset++) {
        const d = format(addDays(new Date(selectedDate), offset), 'yyyy-MM-dd');
        const cbSnap = await getDoc(doc(db, 'days', d, 'checkboxes', currentUser.uid));
        if (!cbSnap.exists()) continue;
        const cb = cbSnap.data() as Checkboxes;
        const completed = cb.prayerDone && (isFitnessDay(d) ? (cb.videoDone || cb.otherFitnessDone) : true);
        if (completed) doneSet.add(d);
      }
      setCompletedDates(doneSet);
    })();
  }, [currentUser, selectedDate]);

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const usersSnap = await getDocs(collection(db, 'users'));

      const userDocs = await Promise.all(
        usersSnap.docs.map(async (uDoc) => {
          const uid = uDoc.id;
          const profile = uDoc.data() as { profilePicUrl?: string; displayName?: string };

          const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', uid));
          const cb = cbSnap.exists() ? (cbSnap.data() as Checkboxes) : DEFAULT_CHECKBOXES;
          const completed = cb.prayerDone && (showFitness ? (cb.videoDone || cb.otherFitnessDone) : true);

          return { uid, profilePicUrl: profile.profilePicUrl, displayName: profile.displayName, completed };
        })
      );

      setUserStatuses(userDocs);
    })();
  }, [currentUser, selectedDate]);

   useEffect(() => {
    if (!currentUser) return;
    const fetchCheckboxes = async () => {
      const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', currentUser.uid));
      if (cbSnap.exists()) {
        setCheckboxes(cbSnap.data() as Checkboxes);
      } else {
        setCheckboxes(DEFAULT_CHECKBOXES);
      }
    };
    fetchCheckboxes();
  }, [currentUser, selectedDate]);

  useEffect(() => {
    if (!currentUser) {
      setCompletedDates(new Set());
      return;
    }

    (async () => {
      const doneSet = new Set<string>();
      for (let offset = -30; offset <= 5; offset++) {
        const d = format(addDays(new Date(selectedDate), offset), 'yyyy-MM-dd');
        const cbSnap = await getDoc(doc(db, 'days', d, 'checkboxes', currentUser.uid));
        if (!cbSnap.exists()) continue;
        const cb = cbSnap.data() as Checkboxes;
        const completed = cb.prayerDone && (isFitnessDay(d) ? (cb.videoDone || cb.otherFitnessDone) : true);
        if (completed) doneSet.add(d);
      }
      setCompletedDates(doneSet);
    })();
  }, [currentUser, selectedDate]);

  const saveCheckboxes = async (partial: Partial<Checkboxes>) => {
    if (!currentUser) return;
    const updated = { ...checkboxes, ...partial };
    setCheckboxes(updated);

    await setDoc(
      doc(db, 'days', selectedDate, 'checkboxes', currentUser.uid),
      updated,
      { merge: true }
    );
  };

  if (loading) return <p>Loading Daily Lift...</p>;

  return (
    <div className="daily-page">
      <Logo size={200} />
      <DeployToast />
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
      <Devotional selectedDate={selectedDate} />

      {showFitness && (
        <>
          <div className="section-header" style={{ marginBottom: '-20px' }}>
            <input
              className="checkboxes"
              type="checkbox"
              checked={checkboxes.videoDone}
              onChange={() => saveCheckboxes({ videoDone: !checkboxes.videoDone })}
            />
            <h3>🏅 Fitness Challenge</h3>
          </div>
          <WorkoutVideos selectedDate={selectedDate} />
          <hr />
          {todayDevo?.funnyInspiration && (
            <div className="funny-inspiration-card">
              <p className="funny-inspiration-emoji">😄</p>
              <p className="funny-inspiration-text">{todayDevo.funnyInspiration}</p>
            </div>
          )}
          <hr />
        </>
      )}

      {!showFitness && (
        <>
          <h3>🧘‍♀️ Rest Day</h3>
          <p>Use today to reflect, stretch, or rest—you’ve earned it!</p>
          <hr />
        </>
      )}

      <div className="section-header">
        <input
          className="checkboxes"
          type="checkbox"
          checked={checkboxes.otherFitnessDone}
          onChange={() => saveCheckboxes({ otherFitnessDone: !checkboxes.otherFitnessDone })}
        />
        <h3>📝 Custom Workout {showFitness ? '' : '(Optional)'}</h3>
      </div>

      <input
        type="text"
        className="input"
        placeholder="🏃 log a custom workout..."
        value={checkboxes.otherFitnessNote || ''}
        onChange={(e) => saveCheckboxes({ otherFitnessNote: e.target.value })}
      />

{googleFitAuthorized && (
  <GoogleFitMetrics selectedDate={selectedDate} />
)}

      {!loading && userGroupIds.length > 0 && (
        <>
          <h3>💛 {userGroupIds.length > 1 ? 'My Lift Circles' : 'My Lift Circle'}</h3>
          {userGroupIds.map((groupId) => (
            <GroupMembers
              key={groupId}
              groupId={groupId}
              selectedDate={selectedDate}
              showFitness={showFitness}
            />
          ))}
        </>
      )}

      <p className="encourage">
        Lift up your friends in prayer and encourage them to do their daily lift!
      </p>
    </div>
  );
};

export default DailyLiftPage;
