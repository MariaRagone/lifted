 export function getInitials(name?: string): string {
  if (!name) return '?';

  const parts = name.trim().split(' ').filter(Boolean);
  const first = parts[0]?.[0]?.toUpperCase() ?? '';
  const last = parts[1]?.[0]?.toUpperCase() ?? '';

  if (first && last) {
    return first + last;
  }
  if (first) {
    return first + first; 
  }
  return '?';}


