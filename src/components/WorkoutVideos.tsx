import React, { useEffect, useState } from 'react';
import rawVideos from '../data/categorizedVideos.json';  // your JSON import
import { categorizeVideos, getRandomVideo, Video, RawVideo } from '../utilities/videoHelpers';

const WorkoutVideos: React.FC = () => {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, Video[]>>({
    "10": [],
    "20": [],
    "30": [],
    "30+": [],
  });

  useEffect(() => {
    // rawVideos is loaded from JSON and typed as RawVideo[]
  const categorized: Record<string, Video[]> = {};   
   setVideosByCategory(categorized);
  }, []);

  if (!Object.values(videosByCategory).some((arr) => arr.length > 0)) return <p>Loading videos…</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Workout Videos</h2>
      {Object.entries(videosByCategory).map(([category, vids]) => (
        <div key={category}>
          <h3 className="text-lg mt-4 mb-2 font-semibold">{category} Minute Videos</h3>
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
