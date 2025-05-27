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
import ActivitySummary from '../components/GoogleFitSummary';

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
  const [groupMembers, setGroupMembers] = useState<Record<string, UserStatus[]>>({});

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
          setUserGroupIds(userData.groupId);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
  if (!currentUser) return;

  const fetchUserData = async () => {
    const uid = currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();
    setUserName(userData?.displayName || currentUser.email || 'User');

    const groupIds: string[] = userData?.groupIds || (userData?.groupId ? [userData.groupId] : []);
    setUserGroupIds(groupIds);

    setLoading(false); // ✅ now we’re truly done loading
  };

  fetchUserData();
}, [currentUser]);


  if (loading) return <p>Loading...</p>;
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleLeaveGroup = async (groupId: string) => {
  if (!currentUser) return;

  await setDoc(doc(db, 'groups', groupId, 'members', currentUser.uid), {}, { merge: false });

  const userRef = doc(db, 'users', currentUser.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const currentGroups: string[] = userData?.groupIds || [];

  const updatedGroups = currentGroups.filter((id) => id !== groupId);

  await setDoc(userRef, { groupIds: updatedGroups }, { merge: true });

  setUserGroupIds(updatedGroups);
};

 

    return (
  <div className='container'>
    <Logo size={200} />
    {!currentUser && <p>Please sign in.</p>}
    <h1 className='welcome'>Welcome, {userName}!</h1>
    <h2 className='announcement'>This page is in test mode! Coming soon...stats and other stuff</h2>


    {currentUser && userGroupIds && (
      <div className='streak-box'>
        <h2>🔥 Current Streak: {streakCount} {streakCount === 1 ? 'day' : 'days'}</h2>
 {/* <DailyStreak completedDates={completedDates} /> */}
      {/* <StreakHeatmap completedDates={new Set(completedDates)} /> */}      </div>
    )}
    <ActivitySummary steps={10234} heartPoints={10} />

{currentUser && userGroupIds.length > 0 && (
  <>
    <h3 style={{ marginLeft: '20px' }}>
      {userGroupIds.length > 1 ? 'My Lift Circles' : 'My Lift Circle'}
    </h3>
    {userGroupIds.map((groupId) => (
<div key={groupId} style={{ marginBottom: '20px' }}>
  <GroupMembers groupId={groupId} selectedDate={''} showFitness={false} />
  <button
    onClick={() => handleLeaveGroup(groupId)}
    style={{
      marginLeft: '20px',
      backgroundColor: '#e05d5d',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer'
    }}
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

    <button style={{ marginBottom: '60px'}} onClick={handleLogout} className='logout-button'>Log Out</button>
  </div>
);
}
