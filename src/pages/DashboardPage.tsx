// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../library/firebase';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';

import DailyStreak from '../components/DailyStreak';
import { calculateStreak } from '../utilities/dailyStreakHelpers';
import StreakHeatmap from '../components/StreakHeatmap';
import Devotional from '../components/Devotional';
import Logo from '../components/Logo';
import GroupSelector from '../components/GroupSelector';
import GroupMembers from '../components/GroupMemembers';
import '../components/Buttons.css';

import GoogleFitConnect from '../library/GoogleFitConnect';
import GoogleFitDisconnect from '../components/googleFit/GoogleFitDisconnect';

interface UserStatus {
  uid: string;
  displayName?: string;
  profilePicUrl?: string;
  completed: boolean;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userGroupIds, setUserGroupIds] = useState<string[]>([]);
  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false);

  const navigate = useNavigate();

  // Listen for Firebase auth & load initial user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        setUserName(userData?.displayName || user.email || 'User');
        // groups
        if (userData?.groupId) {
          setUserGroupIds(userData.groupId);
        }
        // google fit flag
        setGoogleFitAuthorized(userData?.googleFitAuthorized ?? false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // (Optional) Fetch fresh user doc whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      if (data) {
        setUserName(data.displayName || currentUser.email || 'User');
        const groups: string[] =
          data.groupIds ||
          (data.groupId ? [data.groupId] : []);
        setUserGroupIds(groups);
        setGoogleFitAuthorized(data.googleFitAuthorized ?? false);
      }
      setLoading(false);
    })();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;

    // remove from group membership subcollection
    await setDoc(
      doc(db, 'groups', groupId, 'members', currentUser.uid),
      {},
      { merge: false }
    );
    // update user doc
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    const currentGroups: string[] = userSnap.data()?.groupIds || [];
    const updated = currentGroups.filter((id) => id !== groupId);
    await setDoc(userRef, { groupIds: updated }, { merge: true });
    setUserGroupIds(updated);
  };

  if (loading) return null;

  return (
    <div className="container">
      <Logo size={200} />

      {!currentUser && <p>Please sign in.</p>}

      <h1 className="welcome">Welcome, {userName}!</h1>
      <h2 className="announcement">
        This page is in test mode! Coming soon...stats and other stuff
      </h2>

      {currentUser && !googleFitAuthorized && (
        <GoogleFitConnect onAuthorized={() => setGoogleFitAuthorized(true)} />
      )}

      {currentUser && googleFitAuthorized && (
        <GoogleFitDisconnect onDisconnect={() => setGoogleFitAuthorized(false)} />
      )}

      {currentUser && userGroupIds.length > 0 && (
        <div className="streak-box">
          <h2>
            🔥 Current Streak: {streakCount}{' '}
            {streakCount === 1 ? 'day' : 'days'}
          </h2>
          {/* <DailyStreak completedDates={completedDates} /> */}
          {/* <StreakHeatmap completedDates={new Set(completedDates)} /> */}
        </div>
      )}

      {currentUser && userGroupIds.length > 0 && (
        <>
          <h3 style={{ marginLeft: '20px' }}>
            {userGroupIds.length > 1 ? 'My Lift Circles' : 'My Lift Circle'}
          </h3>
          {userGroupIds.map((groupId) => (
            <div key={groupId} style={{ marginBottom: '20px' }}>
              <GroupMembers
                groupId={groupId}
                selectedDate={''}
                showFitness={false}
              />
              <button
                onClick={() => handleLeaveGroup(groupId)}
                className='cancel'
              >
                Leave Group
              </button>
            </div>
          ))}
        </>
      )}

      {currentUser && (
        <GroupSelector
          user={{
            uid: currentUser.uid,
            displayName: currentUser.displayName || '',
            profilePicUrl: currentUser.photoURL || '',
          }}
          onGroupJoined={(newGroupId) => {
            setUserGroupIds((prev) => [...new Set([...prev, newGroupId])]);
          }}
        />
      )}

      <button
        style={{ marginBottom: '60px' }}
        onClick={handleLogout}
        className="btn-primary"
      >
        Log Out
      </button>
    </div>
  );
}
