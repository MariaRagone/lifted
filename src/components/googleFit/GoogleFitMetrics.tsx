// src/components/GoogleFitMetrics.tsx
import React, { useEffect, useState, useRef } from 'react';
import { gapi } from 'gapi-script';
import { isSameDay, parseISO } from 'date-fns';
import './GoogleFitMetrics.css';
/// <reference types="gapi.client" />
/// <reference types="gapi.client.fitness" />
/// <reference types="gapi.auth2" />

interface Props {
  selectedDate: string; // yyyy-MM-dd
}

const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const API_KEY       = import.meta.env.VITE_GOOGLE_API_KEY!;
const SCOPES        = 'https://www.googleapis.com/auth/fitness.activity.read';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest';

const GoogleFitMetrics: React.FC<Props> = ({ selectedDate }) => {
  const [steps, setSteps]             = useState<number | null>(null);
  const [heartPoints, setHeartPoints] = useState<number | null>(null);
  const [lastSync, setLastSync]       = useState<Date | null>(null);

  const initRef     = useRef(false);
  const intervalRef = useRef<number | undefined>(undefined);

  const fetchGoogleFitData = async () => {
    // ensure our token is fresh
    const auth2      = gapi.auth2.getAuthInstance();
    const googleUser = auth2.currentUser.get();
    await googleUser.reloadAuthResponse();

    // compute daily window
    const day = parseISO(selectedDate);
    const start = new Date(day);
    start.setHours(0,0,0,0);

    // if it's today, end at now; otherwise end at 23:59:59
    const end = isSameDay(day, new Date())
      ? new Date()                // up to current time
      : (() => { const d = new Date(day); d.setHours(23,59,59,999); return d; })();

    try {
      const [{ result: stepRes }, { result: heartRes }] = await Promise.all([
        gapi.client.fitness.users.dataset.aggregate({
          userId: 'me',
          resource: {
            aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
            bucketByTime: { durationMillis: '86400000' },
            startTimeMillis: start.getTime().toString(),
            endTimeMillis:   end.getTime().toString(),
          },
        }),
        gapi.client.fitness.users.dataset.aggregate({
          userId: 'me',
          resource: {
            aggregateBy: [{ dataTypeName: 'com.google.heart_minutes' }],
            bucketByTime: { durationMillis: '86400000' },
            startTimeMillis: start.getTime().toString(),
            endTimeMillis:   end.getTime().toString(),
          },
        }),
      ]);

      setSteps(stepRes.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal ?? 0);
      setHeartPoints(heartRes.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal ?? 0);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching Google Fit data', err);
      setSteps(null);
      setHeartPoints(null);
      setLastSync(null);
    }
  };

  // 1) init gapi once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      await new Promise<void>(r => gapi.load('client:auth2', r));
      await (gapi.client as any).init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [DISCOVERY_DOC],
      });
      await gapi.client.load('fitness', 'v1');
    })().catch(console.error);
  }, []);

  // 2) on date change: fetch once + start/stop polling
  useEffect(() => {
    // clear any existing
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
    }

    // reset UI
    setSteps(null);
    setHeartPoints(null);
    setLastSync(null);

    // immediate fetch
    fetchGoogleFitData();

    // if today, poll every 20s
    if (isSameDay(parseISO(selectedDate), new Date())) {
      intervalRef.current = window.setInterval(fetchGoogleFitData, 20_000);
    }

    // cleanup
    return () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDate]);

  return (
    <div className="fitness-card">
      <h3>📊 Google Fit Metrics</h3>
      <div style={{ whiteSpace: 'nowrap' }}>
        {steps !== null && (
          <span className="fitness-row">
            <span className="icon">🚶</span> Steps: {steps.toLocaleString()}
          </span>
        )}
        {heartPoints !== null && (
          <span className="fitness-row">
            <span className="icon">❤️</span> Heart Points: {Math.round(heartPoints)}
          </span>
        )}
      </div>
        {lastSync && (
          <div className="last-sync">
            Last synced: {lastSync.toLocaleTimeString()}
          </div>
        )}
    </div>
  );
};

export default GoogleFitMetrics;
