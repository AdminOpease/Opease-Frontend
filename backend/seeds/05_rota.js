import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('rota_schedule').del();
  await knex('rota_weeks').del();

  const weekRows = [];
  // Start 4 weeks ago from current week (Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek - 28); // 4 weeks back, aligned to Sunday
  for (let w = 0; w < 15; w++) {
    const s = new Date(startDate);
    s.setDate(startDate.getDate() + w * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    // Use Thursday of the week for ISO week calculation
    const thu = new Date(s);
    thu.setDate(s.getDate() + 4); // Sunday + 4 = Thursday
    weekRows.push({
      week_number: getISOWeek(thu),
      start_date: toISO(s),
      end_date: toISO(e),
    });
  }

  await knex('rota_weeks').insert(weekRows);
  // No pre-filled schedule — availability is requested per week
}

function getISOWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
