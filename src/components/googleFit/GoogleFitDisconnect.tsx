import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../library/firebase';
import '../Buttons.css';

const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY       = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES        = 'https://www.googleapis.com/auth/fitness.activity.read';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest';

interface Props {
  onDisconnect: () => void;
}

const GoogleFitDisconnect: React.FC<Props> = ({ onDisconnect }) => {
  const [gapiReady, setGapiReady] = useState(false);

  useEffect(() => {
    const initGapi = async () => {
      try {
        await new Promise<void>(res => gapi.load('client:auth2', res));
        await (gapi.client as any).init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [DISCOVERY_DOC],
        });
        setGapiReady(true);
      } catch (err) {
        console.error('Failed to initialize Google API', err);
      }
    };
    initGapi();
  }, []);

  const handleDisconnect = async () => {
    try {
      if (!gapiReady) {
        console.warn('Google API not yet initialized');
      }

      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.disconnect();
        await authInstance.signOut();
      }

      if (auth.currentUser) {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { googleFitAuthorized: false },
          { merge: true }
        );
      }

      onDisconnect();
    } catch (err) {
      console.error('Error disconnecting from Google Fit', err);
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      className="cancel"
      disabled={!gapiReady}
    >
      Disconnect from Google Fit
    </button>
  );
};

export default GoogleFitDisconnect;
