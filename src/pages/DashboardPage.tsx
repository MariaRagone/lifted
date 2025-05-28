// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { onSnapshot, doc, Unsubscribe, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../library/firebase';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    let unsubscribeDoc: Unsubscribe | undefined;

    // 1) Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      // tear down any previous doc listener
      if (unsubscribeDoc) unsubscribeDoc();

      if (user) {
        const userRef = doc(db, 'users', user.uid);

        // 2) Real-time listener on the user doc
        unsubscribeDoc = onSnapshot(userRef, (snap) => {
          const data = snap.data() || {};

          // displayName
          setUserName(data.displayName || user.email || 'User');

          // groupIds (support both singular/groupIds)
          const groups: string[] = data.groupIds
            || (data.groupId ? [data.groupId] : []);
          setUserGroupIds(groups);

          // googleFitAuthorized flag
          setGoogleFitAuthorized(!!data.googleFitAuthorized);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Leave group handler remains the same
  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;

    // remove membership doc
    await setDoc(
      doc(db, 'groups', groupId, 'members', currentUser.uid),
      {},
      { merge: false }
    );

    // remove from user.groupIds
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    const currentGroups: string[] = userSnap.data()?.groupIds || [];
    const updated = currentGroups.filter((id) => id !== groupId);
    await setDoc(userRef, { groupIds: updated }, { merge: true });
    setUserGroupIds(updated);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
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
                className="cancel"
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

      {currentUser && !googleFitAuthorized && (
        <GoogleFitConnect onAuthorized={() => setGoogleFitAuthorized(true)} />
      )}

      {currentUser && googleFitAuthorized && (
        <GoogleFitDisconnect onDisconnect={() => setGoogleFitAuthorized(false)} />
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
