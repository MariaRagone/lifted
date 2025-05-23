import { format, subDays, parseISO, isBefore } from 'date-fns';

/**
 * Calculate the current streak count of consecutive completed days ending today or yesterday.
 * @param completedDates Set of strings in 'yyyy-MM-dd' format representing completed days.
 * @param todayStr Current day string in 'yyyy-MM-dd' format.
 */
export function calculateStreak(completedDates: Set<string>, todayStr: string): number {
  let streak = 0;
  let day = parseISO(todayStr);

  while (completedDates.has(format(day, 'yyyy-MM-dd'))) {
    streak++;
    day = subDays(day, 1);
  }

  return streak;
}
