import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../library/firebase';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import DailyStreak from '../components/DailyStreak';
import { calculateStreak } from '../utilities/dailyStreakHelpers';
import StreakHeatmap from '../components/StreakHeatmap';
import Devotional from '../components/Devotional';
import Logo from '../components/Logo';
import GroupSelector from '../components/GroupSelector'; 


export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);

  const navigate = useNavigate();

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
     const uid = user.uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        const userData = userDoc.data();
        setUserName(userData?.displayName || user.email || 'User');
        if (userData?.groupId) {
          setUserGroupId(userData.groupId);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <p>Loading...</p>;
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

 

    return (
  <div className='container'>
    <Logo size={200} />
    {!currentUser && <p>Please sign in.</p>}
    <h1 className='welcome'>Welcome, {userName}!</h1>
    <h2 className='announcement'>Coming soon...stats and other stuff</h2>

    {currentUser && !userGroupId && (
      <GroupSelector
        user={{
          uid: currentUser.uid,
          displayName: currentUser.displayName || '',
          profilePicUrl: currentUser.photoURL || '',
        }}
        onGroupJoined={(groupId) => setUserGroupId(groupId)}
      />
    )}

    {currentUser && userGroupId && (
      <div className='streak-box'>
        <h2>🔥 Current Streak: {streakCount} {streakCount === 1 ? 'day' : 'days'}</h2>
 {/* <DailyStreak completedDates={completedDates} /> */}
      {/* <StreakHeatmap completedDates={new Set(completedDates)} /> */}      </div>
    )}

    <button onClick={handleLogout} className='logout-button'>Log Out</button>
  </div>
);
}
