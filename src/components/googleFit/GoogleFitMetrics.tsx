// src/components/GoogleFitMetrics.tsx
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { isSameDay, parseISO } from 'date-fns';
/// <reference types="gapi.client" />
/// <reference types="gapi.client.fitness" />
/// <reference types="gapi.auth2" />

interface Props {
  selectedDate: string; // yyyy-MM-dd
}

const GoogleFitMetrics: React.FC<Props> = ({ selectedDate }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [heartPoints, setHeartPoints] = useState<number | null>(null);

const fetchGoogleFitData = async () => {
  // parse once
  const day = parseISO(selectedDate);

  // start of day
  const startDate = new Date(day);
  startDate.setHours(0, 0, 0, 0);
  const startTimeMillis = startDate.getTime().toString();

  // end of day
  const endDate = new Date(day);
  endDate.setHours(23, 59, 59, 999);
  const endTimeMillis = endDate.getTime().toString();

  const stepResult = await gapi.client.fitness.users.dataset.aggregate({
    userId: 'me',
    resource: {
      aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
      bucketByTime: { durationMillis: '86400000' },
      startTimeMillis,
      endTimeMillis,
    },
  });

  const heartResult = await gapi.client.fitness.users.dataset.aggregate({
    userId: 'me',
    resource: {
      aggregateBy: [{ dataTypeName: 'com.google.heart_minutes' }],
      bucketByTime: { durationMillis: '86400000' },
      startTimeMillis,
      endTimeMillis,
    },
  });

  setSteps(
    stepResult.result.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]
      ?.intVal ?? 0
  );
  setHeartPoints(
    heartResult.result.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]
      ?.fpVal ?? 0
  );
};

  useEffect(() => {
    fetchGoogleFitData();

    const isToday = isSameDay(parseISO(selectedDate), new Date());
    if (!isToday) return;

    const interval = setInterval(fetchGoogleFitData, 20000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="fitness-card">
      <h3>📊 Google Fit</h3>
      {steps !== null && (
        <div className="fitness-row">
          <span className="icon">🚶</span> Steps: {steps.toLocaleString()}
        </div>
      )}
      {heartPoints !== null && (
        <div className="fitness-row">
          <span className="icon">❤️</span> Heart Points: {Math.round(heartPoints)}
        </div>
      )}
    </div>
  );
};

export default GoogleFitMetrics;
