import React, { useEffect, useState } from 'react';

const DailyDevotional = () => {
  const [devos, setDevos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/dailyDevos.json')
      .then((res) => res.json())
      .then((data) => setDevos(data));
  }, []);

  const todayIndex = new Date().getDate() % devos.length;
  const todayDevo = devos[todayIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Today's Devotional</h2>
      {todayDevo ? (
        <div>
          <h3 className="font-semibold">{todayDevo.title}</h3>
          <p>{todayDevo.text}</p>
        </div>
      ) : (
        <p>Loading devotional...</p>
      )}
    </div>
  );
};

export default DailyDevotional;
