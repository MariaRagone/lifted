// src/components/ScrollingDates.tsx
import React, { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import './ScrollingDates.css';

export interface ScrollingDatesProps {
  /** yyyy-MM-dd format */
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** list of yyyy-MM-dd strings to show */
  dates: string[];
}

const ScrollingDates: React.FC<ScrollingDatesProps> = ({
  selectedDate,
  onSelectDate,
  dates,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // whenever selectedDate changes, scroll its button into center view
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
      {dates.map((d) => {
        const isActive = d === selectedDate;
        return (
          <button
            key={d}
            ref={isActive ? activeButtonRef : undefined}
            className={isActive ? 'date-btn active' : 'date-btn'}
            onClick={() => onSelectDate(d)}
          >
            {format(parseISO(d), 'MMM d')}
          </button>
        );
      })}
    </div>
  );
};

export default ScrollingDates;
