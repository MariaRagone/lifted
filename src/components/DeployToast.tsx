import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../library/firebase';
import './DeployToast.css';

const APP_VERSION = '2025-05-26-v1';

const DeployToast: React.FC = () => {
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      if (data?.lastSeenAppVersion !== APP_VERSION) {
        setShow(true);
      }
    });

    return unsubscribe;
  }, []);

  const dismissToast = async () => {
    if (userId) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { lastSeenAppVersion: APP_VERSION }, { merge: true });
    }
    setShow(false);
  };

  if (!show) return null;



  return (
    <div className="deploy-toast">
      <strong>🚀 What's New:</strong>
      <ul>
        <li>📣 Users can connect to GoogleFit to show steps and heartpoints</li>
        <li>📣 About page added.</li>
        <li>📣 Added privacy policy</li>
        <li>📣 Users can log an optional workout on rest days.</li>
        <li>📣 Users can create and join unique groups</li>
        <li>📣 Lift Circles show progress bars</li>
        <li>📣 Daily checkmarks now persist correctly</li>
        <li>📣 Bug fixes and UI improvements</li>

      </ul>
      <button onClick={dismissToast} className="toast-close">Got it</button>



    </div>
  );
};

export default DeployToast;
