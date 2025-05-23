import React, { useEffect, useState } from 'react';
import rawVideos from '../data/categorizedVideos.json';
import './WorkoutVideos.css';
import { getRandomVideo, Video, RawVideo } from '../utilities/videoHelpers';

interface SelectedVideo {
  category: string;
  title: string;
  embedUrl: string;
}

const WorkoutVideos: React.FC = () => {
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);

  useEffect(() => {
    const byCat: Record<string, Video[]> = {
      '10': (rawVideos['10 minutes'] || []).map(v => ({
        videoId: v.videoId,
        title: v.title,
        durationMinutes: Math.ceil(v.durationSeconds / 60),
        embedUrl: v.embedUrl,
      })),
      '20': (rawVideos['20 minutes'] || []).map(v => ({
        videoId: v.videoId,
        title: v.title,
        durationMinutes: Math.ceil(v.durationSeconds / 60),
        embedUrl: v.embedUrl,
      })),
      '30': (rawVideos['30 minutes'] || []).map(v => ({
        videoId: v.videoId,
        title: v.title,
        durationMinutes: Math.ceil(v.durationSeconds / 60),
        embedUrl: v.embedUrl,
      })),
      '30+': (rawVideos['30+ minutes'] || []).map(v => ({
        videoId: v.videoId,
        title: v.title,
        durationMinutes: Math.ceil(v.durationSeconds / 60),
        embedUrl: v.embedUrl,
      })),
    };

    const buckets = [
      { key: '10', label: '10 minutes' },
      { key: '20', label: '20 minutes' },
      { key: '30', label: '30 minutes' },
      { key: '30+', label: '30+ minutes' },
    ];

    const picks = buckets
      .map(({ key, label }) => {
        const v = getRandomVideo(byCat[key] || []);
        return v ? { category: label, title: v.title, embedUrl: v.embedUrl } : null;
      })
      .filter((item): item is SelectedVideo => !!item);

    setSelectedVideos(picks);
  }, []);

  if (!selectedVideos.length) return <p>Loading workout videos…</p>;

  return (
    <div className="video-section">
      <h2>Pick your challenge…</h2>
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
