import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../library/firebase';
import './DeployToast.css';

const APP_VERSION = '2025-05-28-v3';

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
        <li>📣 UI updates</li>
        <li>📣 Dashboard updates</li>
      </ul>
      <button onClick={dismissToast} className="toast-close">Got it</button>



    </div>
  );
};

export default DeployToast;
