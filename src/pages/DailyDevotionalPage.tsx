import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../library/firebase';
import { format } from 'date-fns';

interface DayData {
  verse: string;
  videoUrl?: string;
  isFitnessDay: boolean;
}

const DailyDevotionalPage = () => {
  const [dayData, setDayData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const docRef = doc(db, "days", todayStr);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDayData(docSnap.data());
      } else {
        console.warn("No devotional found for today.");
      }
    };

    fetchData();
  }, []);

  // Only log when data is ready
  useEffect(() => {
    if (dayData) {
    }
  }, [dayData]);

  if (!dayData) return <div>Loading...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Daily Lift</h2>
      <h2>Prayer</h2>
      <p>{dayData.verse}</p>

      {dayData.isFitnessDay && dayData.videoUrl && (
        <>
          <h3>Lift</h3>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={dayData.videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
              }}
            ></iframe>
          </div>
        </>
      )}
      {!dayData.isFitnessDay && (
        <>
        <h2>Rest Day</h2></>
      )}
    </div>
  );
};

export default DailyDevotionalPage;
