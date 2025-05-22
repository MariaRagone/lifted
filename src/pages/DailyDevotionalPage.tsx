import { doc, getDoc } from 'firebase/firestore';
import { db } from '../library/firebase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const DailyDevotionalPage = () => {
  const [verse, setVerse] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFitnessDay, setIsFitnessDay] = useState(false);

  useEffect(() => {
    const fetchDevotional = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const docRef = doc(db, 'days', today);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setVerse(data.verse);
        setVideoUrl(data.videoUrl);
        setIsFitnessDay(data.isFitnessDay);
      } else {
        console.log('No devotional found for today.');
      }
    };

    fetchDevotional();
  }, []);

  return (
    <div>
      <h2>Today's Devotional</h2>
      <p><strong>Verse:</strong> {verse}</p>

      {isFitnessDay && (
        <>
          <iframe
            width="560"
            height="315"
            src={videoUrl}
            title="Workout"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </>
      )}
    </div>
  );
};

export default DailyDevotionalPage;
