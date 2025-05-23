import React, { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import './ScrollingDates.css';

export interface ScrollingDatesProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dates: string[];
  completedDates?: Set<string>;
}

const ScrollingDates: React.FC<ScrollingDatesProps> = ({
  selectedDate,
  onSelectDate,
  dates,
  completedDates = new Set() 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedDate]);

  return (
    <div ref={containerRef} className="scrolling-dates">
      {dates.map(d => {
  const isActive = d === selectedDate;
  const done = completedDates.has(d);

  return (
    <button
      key={d}
            ref={isActive ? activeButtonRef : undefined}
      className={isActive ? 'date-btn active' : 'date-btn'}
      onClick={() => onSelectDate(d)}
    >
      <span>{format(parseISO(d), 'MMM d')}</span>
      {done && <span className="check-badge">✓</span>}
    </button>
        );
      })}
    </div>
  );
};

export default ScrollingDates;
