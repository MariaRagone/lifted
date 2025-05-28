import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { isSameDay, parseISO } from 'date-fns';

interface Props {
  selectedDate: string; // yyyy-MM-dd
}

const GoogleFitMetrics: React.FC<Props> = ({ selectedDate }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [heartPoints, setHeartPoints] = useState<number | null>(null);

  const fetchGoogleFitData = async () => {
    const parsedDate = parseISO(selectedDate);
    const startTime = parsedDate.setHours(0, 0, 0, 0);
    const endTime = parsedDate.setHours(23, 59, 59, 999);

    const dataset = `${startTime}000000-${endTime}000000`;

    const stepResult = await gapi.client.fitness.users.dataset.aggregate({
      userId: 'me',
      resource: {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
    });

    const heartResult = await gapi.client.fitness.users.dataset.aggregate({
      userId: 'me',
      resource: {
        aggregateBy: [{ dataTypeName: 'com.google.heart_minutes' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
    });

    const steps = stepResult.result.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    const heart = heartResult.result.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;

    setSteps(steps);
    setHeartPoints(heart);
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
      {steps !== null && (
        <div className="fitness-row">
          <span className="icon">🚶</span>
          <span className="label">Steps</span>
          <span className="value">{steps.toLocaleString()}</span>
        </div>
      )}
      {heartPoints !== null && (
        <div className="fitness-row">
          <span className="icon">❤️</span>
          <span className="label">Heart Points</span>
          <span className="value">{Math.round(heartPoints)}</span>
        </div>
      )}
    </div>
  );
};

export default GoogleFitMetrics;