export interface Video {
  videoId: string;
  title: string;
  durationMinutes: number;
  embedUrl: string;
}

export type RawVideo = {
  videoId: string;
  title: string;
  publishedAt: string;         
  durationSeconds: number;
  embedUrl: string;
};

export function categorizeVideos(videos: RawVideo[]): Record<string, Video[]> {
  const categories: Record<string, Video[]> = {
    "10": [],
    "20": [],
    "30": [],
    "30+": [],
  };

  videos.forEach((v) => {
    const minutes = Math.ceil(v.durationSeconds / 60);
    const video: Video = {
      videoId: v.videoId,
      title: v.title,
      durationMinutes: minutes,
      embedUrl: v.embedUrl,
    };

    if (minutes <= 14) {
      categories["10"].push(video);
    } else if (minutes <= 20) {
      categories["20"].push(video);
    } else if (minutes <= 30) {
      categories["30"].push(video);
    } else {
      categories["30+"].push(video);
    }
  });

  return categories;
}

export function getRandomVideo(videos: Video[]): Video | null {
  if (!videos.length) return null;
  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
}
