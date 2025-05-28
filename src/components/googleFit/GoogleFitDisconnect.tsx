// src/components/GoogleFitDisconnect.tsx
import React from 'react';
import { gapi } from 'gapi-script';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../library/firebase';

interface Props {
  onDisconnect: () => void;
}

const GoogleFitDisconnect: React.FC<Props> = ({ onDisconnect }) => {
  const handleDisconnect = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    // revoke the granted scopes and sign the user out of Google Fit
    await authInstance.disconnect();

    // mark in Firestore that they’re no longer connected
    if (auth.currentUser) {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { googleFitAuthorized: false },
        { merge: true }
      );
    }

    onDisconnect();
  };

  return (
    <div className="fitness-card">
      <button onClick={handleDisconnect} className="disconnect-btn">
        Disconnect from Google Fit
      </button>
    </div>
  );
};

export default GoogleFitDisconnect;
