import React, { useEffect, useState } from 'react';
import categorizedVideos from '../data/categorizedVideos.json';

type Video = {
  videoId: string;
  title: string;
  publishedAt: string;
  durationSeconds: number;
  embedUrl: string;
};

type CategorizedVideos = {
  [category: string]: Video[];
};

const [videos, setVideos] = useState<CategorizedVideos | null>(null);

const WorkoutVideos = () => {
const [videos, setVideos] = useState<Record<string, Video[]> | null>(null);

  useEffect(() => {
    fetch('/categorizedVideos.json')
      .then((res) => res.json())
      .then((data) => setVideos(data));
  }, []);

  if (!videos) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Workout Videos</h2>
      {Object.entries(videos!).map(([category, vids]) => (
        <div key={category}>
          <h3 className="text-lg mt-4 mb-2 font-semibold">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vids.map((video) => (
              <iframe
                key={video.videoId}
                src={video.embedUrl}
                title={video.title}
                width="100%"
                height="200"
                allowFullScreen
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutVideos;
