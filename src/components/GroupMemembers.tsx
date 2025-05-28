import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../library/firebase';
import { getInitials } from '../utilities/userHelpers';
import './GroupMembers.css';

interface GroupMembersProps {
  groupId: string;
  selectedDate: string;
  showFitness: boolean;
}

interface Member {
  uid: string;
  displayName?: string;
  profilePicUrl?: string;
  completed: boolean;
}

const DEFAULT_CHECKBOXES = {
  prayerDone: false,
  videoDone: false,
  otherFitnessDone: false,
};

const GroupMembers: React.FC<GroupMembersProps> = ({ groupId, selectedDate, showFitness }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState<string>(groupId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !selectedDate) return;

    const fetchGroupInfo = async () => {
      setLoading(true);
      try {
        // Fetch members
        const membersRef = collection(db, 'groups', groupId, 'members');
        const snapshot = await getDocs(membersRef);

        const results = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const uid = docSnap.id;
            const { displayName, profilePicUrl } = docSnap.data();

const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', uid));

            const cb = cbSnap.exists() ? cbSnap.data() : DEFAULT_CHECKBOXES;
            const completed =
              cb.prayerDone && (showFitness ? (cb.videoDone || cb.otherFitnessDone) : true);

            return { uid, displayName, profilePicUrl, completed };
          })
        );

        setMembers(results);

        // Fetch group name
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          if (data?.name) setGroupName(data.name);
        }
      } catch (err) {
        console.error('Error loading group members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupInfo();
  }, [groupId, selectedDate, showFitness]);

  if (!groupId || loading) {
    return (
      <p style={{ textAlign: 'center', color: '#888' }}>
        Loading Lift Circle...
      </p>
    );
  }

  const completedCount = members.filter((m) => m.completed).length;
  const progressPercent = members.length > 0 ? (completedCount / members.length) * 100 : 0;

  const getBarColor = (percent: number) => {
    if (percent === 100) return '#4caf50';
    if (percent >= 60) return '#f9b95c';
    return '#e05d5d';
  };

  return (
    <div className="group-members">
      <h4 style={{ marginLeft: '20px', marginBottom: '6px' }}>{groupName}</h4>

      <div style={{ marginLeft: '20px', marginBottom: '12px' }}>
        <div
          style={{
            height: '8px',
            background: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            width: '90%',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: getBarColor(progressPercent),
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <p style={{ fontSize: '12px', marginTop: '4px', color: '#093d44' }}>
          ✅ {completedCount} of {members.length} completed
        </p>
      </div>

      <div className="community-checkins">
        {members.map(({ uid, displayName, profilePicUrl, completed }) => (
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
    </div>
  );
};

export default GroupMembers;
