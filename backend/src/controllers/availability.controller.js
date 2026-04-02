import { v4 as uuid } from 'uuid';
import db from '../config/database.js';

const DAY_COLS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// POST /rota/availability/request — Admin requests availability for a week+depot
export async function requestAvailability(req, res, next) {
  try {
    const { weekId, depot } = req.body;

    // Get all active drivers at this depot
    const drivers = await db('drivers')
      .where({ status: 'Active', depot })
      .select('id');

    if (drivers.length === 0) {
      return res.json({ created: 0, message: 'No active drivers at this depot' });
    }

    // Check which drivers already have a request for this week
    const existing = await db('rota_availability')
      .where({ week_id: weekId })
      .whereIn('driver_id', drivers.map((d) => d.id))
      .select('driver_id');
    const existingIds = new Set(existing.map((e) => e.driver_id));

    // Create pending requests for drivers without one
    const newRows = drivers
      .filter((d) => !existingIds.has(d.id))
      .map((d) => ({
        id: uuid(),
        driver_id: d.id,
        week_id: weekId,
        depot,
        status: 'pending',
        requested_at: new Date().toISOString(),
      }));

    if (newRows.length > 0) {
      await db('rota_availability').insert(newRows);

      // Also create rota_schedule rows with 'R' (rest) as default for all days
      const newDriverIds = newRows.map((r) => r.driver_id);
      const existingSchedules = await db('rota_schedule')
        .where({ week_id: weekId })
        .whereIn('driver_id', newDriverIds)
        .select('driver_id');
      const hasSchedule = new Set(existingSchedules.map((s) => s.driver_id));

      const scheduleRows = newDriverIds
        .filter((did) => !hasSchedule.has(did))
        .map((did) => ({
          id: uuid(),
          driver_id: did,
          week_id: weekId,
          sun: 'R', mon: 'R', tue: 'R', wed: 'R', thu: 'R', fri: 'R', sat: 'R',
        }));

      if (scheduleRows.length > 0) {
        await db('rota_schedule').insert(scheduleRows);
      }
    }

    res.json({
      created: newRows.length,
      alreadyRequested: existingIds.size,
      total: drivers.length,
    });
  } catch (err) {
    next(err);
  }
}

// GET /rota/availability?weekId=X&depot=Y — Admin lists availability for a week
export async function listAvailability(req, res, next) {
  try {
    const { weekId, depot } = req.query;
    let q = db('rota_availability')
      .join('drivers', 'rota_availability.driver_id', 'drivers.id')
      .select(
        'rota_availability.*',
        'drivers.first_name',
        'drivers.last_name',
        'drivers.amazon_id',
        'drivers.depot'
      )
      .orderBy('drivers.last_name', 'asc');

    if (weekId) q = q.where('rota_availability.week_id', weekId);
    if (depot) q = q.where('rota_availability.depot', depot);

    const rows = await q;
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /rota/availability/mine — Candidate gets their pending requests
export async function myAvailability(req, res, next) {
  try {
    const email = req.user.email;
    const driver = await db('drivers').where({ email }).first();
    if (!driver) return res.json({ data: [] });

    // Return both pending and submitted availability for current/future weeks
    const today = new Date().toISOString().slice(0, 10);
    const rows = await db('rota_availability')
      .join('rota_weeks', 'rota_availability.week_id', 'rota_weeks.id')
      .where('rota_availability.driver_id', driver.id)
      .where('rota_weeks.end_date', '>=', today)
      .select(
        'rota_availability.*',
        'rota_weeks.week_number',
        'rota_weeks.start_date',
        'rota_weeks.end_date'
      )
      .orderBy('rota_weeks.start_date', 'asc');

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /rota/availability/:id — Candidate submits availability
export async function submitAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const email = req.user.email;
    const driver = await db('drivers').where({ email }).first();
    if (!driver) return res.status(403).json({ error: 'Driver not found' });

    const row = await db('rota_availability').where({ id, driver_id: driver.id }).first();
    if (!row) return res.status(404).json({ error: 'Availability request not found' });

    const update = { status: 'submitted', submitted_at: new Date().toISOString() };
    for (const day of DAY_COLS) {
      if (req.body[day] !== undefined) update[day] = req.body[day];
    }
    if (req.body.notes !== undefined) update.notes = req.body.notes;

    await db('rota_availability').where({ id }).update(update);
    const updated = await db('rota_availability').where({ id }).first();

    // Auto-apply to rota_schedule: A → W, N → R
    const shifts = {};
    for (const day of DAY_COLS) {
      if (updated[day] === 'A') shifts[day] = 'W';
      else if (updated[day] === 'N') shifts[day] = 'R';
    }
    if (Object.keys(shifts).length > 0) {
      const existing = await db('rota_schedule')
        .where({ driver_id: driver.id, week_id: row.week_id })
        .first();
      if (existing) {
        await db('rota_schedule').where({ id: existing.id }).update(shifts);
      } else {
        await db('rota_schedule').insert({
          id: uuid(),
          driver_id: driver.id,
          week_id: row.week_id,
          sun: 'R', mon: 'R', tue: 'R', wed: 'R', thu: 'R', fri: 'R', sat: 'R',
          ...shifts,
        });
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// POST /rota/availability/apply — Admin applies submitted availability to rota_schedule
export async function applyAvailability(req, res, next) {
  try {
    const { weekId, depot } = req.body;

    const submitted = await db('rota_availability')
      .where({ week_id: weekId, depot, status: 'submitted' });

    let applied = 0;
    for (const row of submitted) {
      const shifts = {};
      for (const day of DAY_COLS) {
        if (row[day] === 'A') shifts[day] = 'W';
        else if (row[day] === 'N') shifts[day] = '';
      }
      if (Object.keys(shifts).length === 0) continue;

      // Upsert into rota_schedule
      const existing = await db('rota_schedule')
        .where({ driver_id: row.driver_id, week_id: weekId })
        .first();

      if (existing) {
        await db('rota_schedule').where({ id: existing.id }).update(shifts);
      } else {
        await db('rota_schedule').insert({
          id: uuid(),
          driver_id: row.driver_id,
          week_id: weekId,
          ...shifts,
        });
      }
      applied++;
    }

    res.json({ applied, total: submitted.length });
  } catch (err) {
    next(err);
  }
}
