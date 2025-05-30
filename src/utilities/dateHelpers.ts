import { format, subDays, addDays } from 'date-fns';

export function generateLastNDates(count: number): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = subDays(today, i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }
  return dates;
}

export function generateDateRange(
  startOffset: number,
  endOffset: number,
  pattern = 'yyyy-MM-dd'
): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let offset = startOffset; offset <= endOffset; offset++) {
    const d = offset < 0 ? subDays(today, -offset) : addDays(today, offset);
    dates.push(format(d, pattern));
  }
  return dates;
}

export function isFitnessDay(date: string): boolean {
  const parsedDate = new Date(date);
  const dayOfWeek = parsedDate.getDay(); // 0 = Sunday, 6 = Saturday

  return dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;
}
