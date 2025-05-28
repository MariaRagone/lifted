import React, { useEffect, useState } from 'react';
import rawDailyVideos from '../data/dailyVideos.json';
import { Video } from '../utilities/videoHelpers';
import './WorkoutVideos.css';

type CategoryKey = '10' | '20' | '30' | '30+';
type VideoMap = Partial<Record<CategoryKey, Video>>;
const dailyVideos = rawDailyVideos as Record<string, VideoMap>;

interface SelectedVideo {
  category: string;
  title: string;
  embedUrl: string;
}

interface WorkoutVideosProps {
  selectedDate: string; // 'YYYY-MM-DD'
}

const WorkoutVideos: React.FC<WorkoutVideosProps> = ({ selectedDate }) => {
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);

  useEffect(() => {
    const dailySet = dailyVideos[selectedDate];
    if (!dailySet) return;

    const orderedCategories: { key: CategoryKey; label: string }[] = [
      { key: "10", label: "10 minutes" },
      { key: "20", label: "20 minutes" },
      { key: "30", label: "30 minutes" },
      { key: "30+", label: "30+ minutes" },
    ];

    const picks = orderedCategories
      .map(({ key, label }) => {
        const v = dailySet[key];        // now okay, VideoMap has an index signature
        return v
          ? { category: label, title: v.title, embedUrl: v.embedUrl }
          : null;
      })
      .filter((item): item is SelectedVideo => !!item);

    setSelectedVideos(picks);
  }, [selectedDate]);

  if (!selectedVideos.length) return <p>Loading workout videos…</p>;

  return (
    <div className="video-section">
      <h2>Pick your challenge… or log a custom workout</h2>
      <div className="workout-carousel">
        {selectedVideos.map(({ category, title, embedUrl }, idx) => (
          <div key={idx} className="workout-item">
            <div className="workout-category">{category}</div>
            <div className="workout-title">{title}</div>
            <iframe
              src={embedUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutVideos;
