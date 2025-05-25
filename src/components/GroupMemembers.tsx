import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../library/firebase';
import { getInitials } from '../utilities/userHelpers';

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

  useEffect(() => {
    if (!groupId || !selectedDate) return;

    const fetchGroupMembersWithStatus = async () => {
      const membersRef = collection(db, 'groups', groupId, 'members');
      const snapshot = await getDocs(membersRef);

      const results = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const uid = docSnap.id;
          const { displayName, profilePicUrl } = docSnap.data();

          const cbSnap = await getDoc(doc(db, 'groups', groupId, 'days', selectedDate, 'checkboxes', uid));
          const cb = cbSnap.exists() ? cbSnap.data() : DEFAULT_CHECKBOXES;
          const completed =
            cb.prayerDone && (showFitness ? (cb.videoDone || cb.otherFitnessDone) : true);

          return { uid, displayName, profilePicUrl, completed };
        })
      );

      setMembers(results);
    };

    fetchGroupMembersWithStatus();
  }, [groupId, selectedDate, showFitness]);

  if (!groupId) {
    return (
      <p style={{ textAlign: 'center', color: '#888' }}>
        Join a Lift Circle to see your group members here.
      </p>
    );
  }

  return (
    <div className="group-members">
      <h4 style={{ marginLeft: '20px', marginBottom: '6px' }}>{groupId}</h4>
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
