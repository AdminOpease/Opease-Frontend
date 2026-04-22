import { v4 as uuid } from 'uuid';
import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { updateAndReturn, insertAndReturn } from '../utils/dbHelpers.js';

// ── Week generation helpers ───────────────────────────────────────────────
// rota_weeks is structural bookkeeping (week_number + date range), not user
// data. If the table is empty (fresh DB, wiped for testing) we auto-generate
// 15 weeks centred on today so Rota / Vans / Plan pages have something to show.
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function generateRotaWeekRows() {
  const rows = [];
  const now = new Date();
  const dow = now.getUTCDay();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow - 28));
  for (let w = 0; w < 15; w++) {
    const s = new Date(start);
    s.setUTCDate(start.getUTCDate() + w * 7);
    const e = new Date(s);
    e.setUTCDate(s.getUTCDate() + 6);
    const thu = new Date(s);
    thu.setUTCDate(s.getUTCDate() + 4);
    rows.push({
      week_number: isoWeekNumber(thu),
      start_date: s.toISOString().slice(0, 10),
      end_date: e.toISOString().slice(0, 10),
    });
  }
  return rows;
}

export async function listWeeks(req, res, next) {
  try {
    let weeks = await db('rota_weeks').orderBy('week_number', 'asc');
    if (weeks.length === 0) {
      // Bootstrap on empty — insert fresh week structure, ignore conflicts on
      // the unique week_number index (covers tiny race between concurrent calls).
      const rows = generateRotaWeekRows();
      await db('rota_weeks').insert(rows).onConflict('week_number').ignore();
      weeks = await db('rota_weeks').orderBy('week_number', 'asc');
    }
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
        'd.first_name', 'd.last_name', 'd.amazon_id', 'd.transporter_id',
        'd.depot', 'd.status as driver_status', 'd.phone'
      )
      .orderBy('d.last_name', 'asc');

    if (weekId) query = query.where('rs.week_id', weekId);
    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);

    let data = await query;

    // Also fetch drivers transferred INTO this depot for this week
    if (weekId && depot && depot !== 'All Depots') {
      const transfers = await db('rota_transfers as rt')
        .join('rota_schedule as rs', 'rt.schedule_id', 'rs.id')
        .join('drivers as d', 'rs.driver_id', 'd.id')
        .select(
          'rs.*',
          'd.first_name', 'd.last_name', 'd.amazon_id', 'd.transporter_id',
          'd.depot', 'd.status as driver_status', 'd.phone',
          'rt.day_col', 'rt.from_depot', 'rt.to_depot', 'rt.assigned_code'
        )
        .where('rt.to_depot', depot)
        .where('rs.week_id', weekId);

      // Group transfers by driver schedule ID
      const transfersBySchedule = {};
      for (const t of transfers) {
        if (!transfersBySchedule[t.id]) transfersBySchedule[t.id] = { ...t, _transfers: {} };
        transfersBySchedule[t.id]._transfers[t.day_col] = {
          from_depot: t.from_depot,
          assigned_code: t.assigned_code,
        };
      }

      // Add transferred drivers (if not already in the list)
      const existingIds = new Set(data.map((r) => r.id));
      for (const entry of Object.values(transfersBySchedule)) {
        if (!existingIds.has(entry.id)) {
          entry._transferred_in = true;
          entry._transfer_days = entry._transfers;
          delete entry._transfers;
          data.push(entry);
        }
      }
    }

    // Fetch outgoing transfers for this week+depot (so origin can see assigned_code)
    if (weekId && depot && depot !== 'All Depots') {
      const outgoing = await db('rota_transfers as rt')
        .join('rota_schedule as rs', 'rt.schedule_id', 'rs.id')
        .select('rt.schedule_id', 'rt.day_col', 'rt.to_depot', 'rt.assigned_code')
        .where('rt.from_depot', depot)
        .where('rs.week_id', weekId);

      const outMap = {};
      for (const o of outgoing) {
        if (!outMap[o.schedule_id]) outMap[o.schedule_id] = {};
        outMap[o.schedule_id][o.day_col] = { to_depot: o.to_depot, assigned_code: o.assigned_code };
      }

      for (const row of data) {
        if (outMap[row.id]) row._outgoing_transfers = outMap[row.id];
      }
    }

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

// ── Transfer endpoints ──────────────────────────────────────────

export async function createTransfer(req, res, next) {
  try {
    const { schedule_id, day_col, from_depot, to_depot } = req.body;
    const existing = await db('rota_transfers').where({ schedule_id, day_col }).first();

    let transfer;
    if (existing) {
      transfer = await updateAndReturn('rota_transfers', { id: existing.id }, { from_depot, to_depot });
    } else {
      transfer = await insertAndReturn('rota_transfers', { schedule_id, day_col, from_depot, to_depot, assigned_code: '' });
    }
    res.status(201).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function deleteTransfer(req, res, next) {
  try {
    const { schedule_id, day_col } = req.body;
    await db('rota_transfers').where({ schedule_id, day_col }).del();
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function updateTransferAssignment(req, res, next) {
  try {
    const { schedule_id, day_col, assigned_code } = req.body;
    const existing = await db('rota_transfers').where({ schedule_id, day_col }).first();
    if (!existing) throw new NotFoundError('Transfer');
    const transfer = await updateAndReturn('rota_transfers', { id: existing.id }, { assigned_code });
    res.json(transfer);
  } catch (err) {
    next(err);
  }
}
