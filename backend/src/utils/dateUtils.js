/**
 * Get ISO date string (YYYY-MM-DD) from a Date object using local time
 */
export function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the day-of-week index (0=Sun, 6=Sat)
 */
export function dayOfWeek(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDay();
}

/**
 * Map day index to column name
 */
const DAY_COLUMNS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function dayColumn(dayIndex) {
  return DAY_COLUMNS[dayIndex];
}

/**
 * Parse a time string like "08:30" to minutes since midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Compute total work time from start/finish/breaks
 */
export function computeWorkTime(startTime, finishTime, breakMinutes = 0) {
  const start = timeToMinutes(startTime);
  const finish = timeToMinutes(finishTime);
  const total = finish - start - breakMinutes;
  if (total <= 0) return '00:00';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
