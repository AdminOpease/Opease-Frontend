import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { updateAndReturn, insertAndReturn } from '../utils/dbHelpers.js';

export async function listWeeks(req, res, next) {
  try {
    const weeks = await db('rota_weeks').orderBy('week_number', 'asc');
    res.json({ data: weeks });
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req, res, next) {
  try {
    const { weekId, depot } = req.query;
    let query = db('rota_schedule as rs')
      .join('drivers as d', 'rs.driver_id', 'd.id')
      .select(
        'rs.*',
        'd.first_name', 'd.last_name', 'd.amazon_id',
        'd.depot', 'd.status as driver_status', 'd.phone'
      )
      .orderBy('d.last_name', 'asc');

    if (weekId) query = query.where('rs.week_id', weekId);
    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);

    const data = await query;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateShift(req, res, next) {
  try {
    const schedule = await updateAndReturn('rota_schedule', { id: req.params.id }, req.body);
    if (!schedule) throw new NotFoundError('Schedule');
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdate(req, res, next) {
  try {
    const { schedules } = req.body;
    const results = [];

    for (const item of schedules) {
      const { driver_id, week_id, ...shifts } = item;
      const existing = await db('rota_schedule')
        .where({ driver_id, week_id })
        .first();

      if (existing) {
        const updated = await updateAndReturn('rota_schedule', { id: existing.id }, shifts);
        results.push(updated);
      } else {
        const created = await insertAndReturn('rota_schedule', { driver_id, week_id, ...shifts });
        results.push(created);
      }
    }

    res.json({ data: results, count: results.length });
  } catch (err) {
    next(err);
  }
}

export async function getCapacity(req, res, next) {
  try {
    const { weekId, depot } = req.query;
    if (!weekId) return res.status(400).json({ error: 'weekId is required' });

    let query = db('rota_schedule as rs')
      .join('drivers as d', 'rs.driver_id', 'd.id')
      .select('rs.sun', 'rs.mon', 'rs.tue', 'rs.wed', 'rs.thu', 'rs.fri', 'rs.sat')
      .where('rs.week_id', weekId)
      .whereNot('d.status', 'Offboarded');

    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);

    const rows = await query;

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const WORK_CODES = ['W', 'Office', 'OfficeLD', 'SD', 'Fleet', 'SB', 'DR', 'C', 'C2', 'NL3', '1P', 'SWA', 'DHW', 'MT'];

    const capacity = {};
    for (const day of days) {
      const codes = {};
      let working = 0;
      for (const row of rows) {
        const code = row[day];
        if (code) {
          codes[code] = (codes[code] || 0) + 1;
          if (WORK_CODES.includes(code)) working++;
        }
      }
      capacity[day] = { codes, working, total: rows.length };
    }

    res.json({ data: capacity });
  } catch (err) {
    next(err);
  }
}
