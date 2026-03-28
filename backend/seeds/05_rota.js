import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('rota_schedule').del();
  await knex('rota_weeks').del();

  const weekRows = [];
  const startDate = new Date(2025, 11, 28);
  for (let w = 0; w < 15; w++) {
    const s = new Date(startDate);
    s.setDate(startDate.getDate() + w * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    weekRows.push({
      week_number: w + 1,
      start_date: toISO(s),
      end_date: toISO(e),
    });
  }

  await knex('rota_weeks').insert(weekRows);

  // Re-fetch weeks to get auto-generated IDs
  const weeks = await knex('rota_weeks').orderBy('week_number', 'asc');

  const drivers = await knex('drivers')
    .whereNotNull('amazon_id')
    .orderBy('amazon_id', 'asc')
    .select('id', 'amazon_id');

  if (drivers.length === 0) return;

  const patterns = [
    ['W', 'W', 'W', 'W', 'W', 'R', 'R'],
    ['R', 'W', 'W', 'W', 'W', 'W', 'R'],
    ['W', 'W', 'R', 'R', 'W', 'W', 'W'],
    ['W', 'R', 'W', 'W', 'W', 'R', 'W'],
    ['SD', 'SD', 'SD', 'SD', 'SD', 'R', 'R'],
    ['W', 'W', 'W', 'R', 'W', 'W', 'R'],
    ['SWA', 'SWA', 'W', 'W', 'W', 'R', 'R'],
    ['W', 'W', 'W', 'W', 'R', 'R', 'W'],
    ['C', 'C', 'C', 'W', 'W', 'R', 'R'],
    ['W', 'W', 'R', 'W', 'W', 'W', 'R'],
    ['W', 'W', 'W', 'W', 'W', 'R', 'R'],
    ['R', 'R', 'W', 'W', 'W', 'W', 'W'],
    ['A', 'A', 'A', 'A', 'A', 'R', 'R'],
    ['Office', 'Office', 'W', 'W', 'W', 'R', 'R'],
    ['W', 'W', 'SB', 'SB', 'W', 'R', 'R'],
  ];

  const schedules = [];

  for (let di = 0; di < drivers.length; di++) {
    const driver = drivers[di];
    const pattern = patterns[di % patterns.length];

    for (const week of weeks) {
      const offset = (week.week_number - 1) % 7;
      const shifted = [...pattern.slice(offset), ...pattern.slice(0, offset)];

      schedules.push({
        id: uuid(),
        driver_id: driver.id,
        week_id: week.id,
        sun: shifted[0],
        mon: shifted[1],
        tue: shifted[2],
        wed: shifted[3],
        thu: shifted[4],
        fri: shifted[5],
        sat: shifted[6],
      });
    }
  }

  const batchSize = 50;
  for (let i = 0; i < schedules.length; i += batchSize) {
    await knex('rota_schedule').insert(schedules.slice(i, i + batchSize));
  }
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
