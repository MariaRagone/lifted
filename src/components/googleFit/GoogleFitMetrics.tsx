// src/components/GoogleFitMetrics.tsx
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { isSameDay, parseISO } from 'date-fns';
import './GoogleFitMetrics.css';
/// <reference types="gapi.client" />
/// <reference types="gapi.client.fitness" />
/// <reference types="gapi.auth2" />

interface Props {
  selectedDate: string; // yyyy-MM-dd
}

const CLIENT_ID       = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY         = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES          = 'https://www.googleapis.com/auth/fitness.activity.read';
const DISCOVERY_DOC   = 'https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest';

const GoogleFitMetrics: React.FC<Props> = ({ selectedDate }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [heartPoints, setHeartPoints] = useState<number | null>(null);

  // pulls data for the given date
  const fetchGoogleFitData = async () => {
    const day = parseISO(selectedDate);

    const startDate = new Date(day);
    startDate.setHours(0, 0, 0, 0);
    const startTimeMillis = startDate.getTime().toString();

    const endDate = new Date(day);
    endDate.setHours(23, 59, 59, 999);
    const endTimeMillis = endDate.getTime().toString();

    const [{ result: stepRes }, { result: heartRes }] = await Promise.all([
      gapi.client.fitness.users.dataset.aggregate({
        userId: 'me',
        resource: {
          aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
          bucketByTime: { durationMillis: '86400000' },
          startTimeMillis,
          endTimeMillis,
        },
      }),
      gapi.client.fitness.users.dataset.aggregate({
        userId: 'me',
        resource: {
          aggregateBy: [{ dataTypeName: 'com.google.heart_minutes' }],
          bucketByTime: { durationMillis: '86400000' },
          startTimeMillis,
          endTimeMillis,
        },
      }),
    ]);

    setSteps(
      stepRes.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal ?? 0
    );
    setHeartPoints(
      heartRes.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal ?? 0
    );
  };

useEffect(() => {
  let intervalId: number;

  const init = async () => {
    await new Promise<void>(res => gapi.load('client:auth2', res));
    await (gapi.client as any).init({ /* … */ });
    await gapi.client.load('fitness', 'v1');
  };

  init()
    .then(fetchGoogleFitData)
    .then(() => {
      // start polling no matter what
      intervalId = window.setInterval(fetchGoogleFitData, 20_000);
    })
    .catch(console.error);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, []); // or [selectedDate]
  return (
    <div className="fitness-card">
      <h3>📊 Google Fit Metrics</h3>
      <div style={{ whiteSpace: 'nowrap' }}>
        {steps !== null && (
          <span className="fitness-row">
            <span className="icon">🚶</span>Steps: {steps.toLocaleString()}
          </span>
        )}
        {heartPoints !== null && (
          <span className="fitness-row">
            <span className="icon">❤️</span>
            Heart Points: {Math.round(heartPoints)}
          </span>
        )}
      </div>
    </div>
  );
};

export default GoogleFitMetrics;
