import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../library/firebase';
import './GroupSelector.css';

interface GroupSelectorProps {
  user: { uid: string; displayName?: string; profilePicUrl?: string };
  onGroupJoined: (groupId: string) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({ user, onGroupJoined }) => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [groupInput, setGroupInput] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const groupId = groupInput.trim();
    if (!groupId) return;

    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      setError('Group not found. Check the code and try again.');
      return;
    }

    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), {
      displayName: user.displayName ?? '',
      profilePicUrl: user.profilePicUrl ?? '',
    });

    await setDoc(doc(db, 'users', user.uid), { groupId }, { merge: true });
    onGroupJoined(groupId);
  };

  const handleCreate = async () => {
    const groupName = groupInput.trim();
    if (!groupName) return;

    const groupId = groupName
    
    const groupRef = doc(db, 'groups', groupId);

    await setDoc(groupRef, {
      name: groupName,
      createdBy: user.uid,
    });

    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), {
      displayName: user.displayName ?? '',
      profilePicUrl: user.profilePicUrl ?? '',
    });

    await setDoc(doc(db, 'users', user.uid), { groupId }, { merge: true });
    onGroupJoined(groupId);
  };

  return (
    <div className="group-selector">
      <h3>{mode === 'create' ? 'Create a Lift Circle' : 'Join a Lift Circle'}</h3>

      <input
        type="text"
        placeholder={mode === 'create' ? 'Circle name (e.g. Sunrise Squad)' : 'Join code'}
        value={groupInput}
        onChange={(e) => setGroupInput(e.target.value)}
        className="input"
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={mode === 'create' ? handleCreate : handleJoin}>
        {mode === 'create' ? 'Create Lift Circle' : 'Join Lift Circle'}
      </button>

      <p style={{ marginTop: '10px' }}>
        {mode === 'create' ? (
          <>
            Already have a code?{' '}
            <span onClick={() => { setMode('join'); setError(''); }} style={{ color: '#f1a84d', cursor: 'pointer' }}>
              Join one
            </span>
          </>
        ) : (
          <>
            Want to start your own?{' '}
            <span onClick={() => { setMode('create'); setError(''); }} style={{ color: '#f1a84d', cursor: 'pointer' }}>
              Create one
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default GroupSelector;
