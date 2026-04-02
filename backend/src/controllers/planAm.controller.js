import { v4 as uuid } from 'uuid';
import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

const DAY_COLS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Default groups to create when generating from rota
const DEFAULT_GROUPS = [
  { title: 'Route Group A', time: '07:30', color: '#1B5E20', bg_color: '#E8F5E9', linked_shift_code: 'W' },
  { title: 'Same Day', time: '08:00', color: '#00695C', bg_color: '#E0F2F1', linked_shift_code: 'SD' },
  { title: 'SWA', time: '08:30', color: '#AD1457', bg_color: '#FCE4EC', linked_shift_code: 'SWA' },
  { title: 'Office', time: '09:00', color: '#0D47A1', bg_color: '#E3F2FD', linked_shift_code: 'Office' },
  { title: 'Standby', time: '10:00', color: '#FF6F00', bg_color: '#FFF8E1', linked_shift_code: 'SB' },
];

export async function list(req, res, next) {
  try {
    const { date, depot } = req.query;
    const groups = await db('plan_am_groups')
      .where({ plan_date: date, depot })
      .orderBy('sort_order', 'asc');

    const groupIds = groups.map((g) => g.id);
    const rows = groupIds.length
      ? await db('plan_am_rows as r')
          .leftJoin('drivers as d', 'r.driver_id', 'd.id')
          .leftJoin('van_assignments as va', function () {
            this.on('va.driver_id', '=', 'r.driver_id')
              .andOn('va.assign_date', '=', db.raw('?', [date]));
          })
          .leftJoin('vans as v', 'va.van_id', 'v.id')
          .select('r.*', 'd.first_name', 'd.last_name', 'd.amazon_id', 'd.transporter_id', 'v.registration as assigned_van')
          .whereIn('r.group_id', groupIds)
          .orderBy('r.sort_order', 'asc')
      : [];

    const rowsByGroup = {};
    for (const row of rows) {
      if (!rowsByGroup[row.group_id]) rowsByGroup[row.group_id] = [];
      rowsByGroup[row.group_id].push(row);
    }

    const data = groups.map((g) => ({
      ...g,
      rows: rowsByGroup[g.id] || [],
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req, res, next) {
  try {
    const group = await insertAndReturn('plan_am_groups', req.body);
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const group = await updateAndReturn('plan_am_groups', { id: req.params.id }, req.body);
    if (!group) throw new NotFoundError('AM Plan Group');
    res.json(group);
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req, res, next) {
  try {
    const deleted = await db('plan_am_groups').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('AM Plan Group');
    res.json({ message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createRow(req, res, next) {
  try {
    const row = await insertAndReturn('plan_am_rows', req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function updateRow(req, res, next) {
  try {
    const row = await updateAndReturn('plan_am_rows', { id: req.params.id }, req.body);
    if (!row) throw new NotFoundError('AM Plan Row');
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function deleteRow(req, res, next) {
  try {
    const deleted = await db('plan_am_rows').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('AM Plan Row');
    res.json({ message: 'Row deleted' });
  } catch (err) {
    next(err);
  }
}

export async function importPlan(req, res, next) {
  try {
    const { plan_date, depot, rows } = req.body;
    let matched = 0;
    let skipped = 0;

    for (const row of rows) {
      const driver = await db('drivers')
        .where({ amazon_id: row.transporter_id })
        .first();

      if (!driver) {
        skipped++;
        continue;
      }

      const amRow = await db('plan_am_rows as r')
        .join('plan_am_groups as g', 'r.group_id', 'g.id')
        .where({ 'g.plan_date': plan_date, 'g.depot': depot, 'r.driver_id': driver.id })
        .select('r.id')
        .first();

      if (amRow) {
        await db('plan_am_rows')
          .where({ id: amRow.id })
          .update({
            van: row.van || null,
            route: row.route || null,
            bay: row.bay || null,
            atlas: row.atlas || null,
          });
        matched++;
      } else {
        skipped++;
      }
    }

    res.json({ matched, skipped, total: rows.length });
  } catch (err) {
    next(err);
  }
}

export async function generateFromRota(req, res, next) {
  try {
    const { date, depot } = req.body;

    // Find which rota_week contains this date
    const week = await db('rota_weeks')
      .where('start_date', '<=', date)
      .where('end_date', '>=', date)
      .first();

    if (!week) {
      return res.json({ message: 'No rota week found for this date', groups: 0, drivers: 0 });
    }

    // Determine which day column (sun/mon/tue/...) — use UTC noon to avoid DST issues
    const dateObj = new Date(date + 'T12:00:00Z');
    const dayCol = DAY_COLS[dateObj.getUTCDay()];

    // Get existing groups for this date+depot
    const groups = await db('plan_am_groups')
      .where({ plan_date: date, depot })
      .orderBy('sort_order', 'asc');

    if (groups.length === 0) {
      return res.json({ groups: 0, drivers: 0, message: 'No groups configured for this date. Add groups first.' });
    }

    let totalDriversAdded = 0;

    for (const group of groups) {
      if (!group.linked_shift_code) continue;

      // Find drivers with this shift code on this day at this depot
      const drivers = await db('rota_schedule as rs')
        .join('drivers as d', 'rs.driver_id', 'd.id')
        .where('rs.week_id', week.id)
        .where(`rs.${dayCol}`, group.linked_shift_code)
        .where('d.depot', depot)
        .where('d.status', 'Active')
        .select('d.id as driver_id');

      // Also include drivers transferred INTO this depot with matching assigned_code
      const transferredIn = await db('rota_transfers as rt')
        .join('rota_schedule as rs', 'rt.schedule_id', 'rs.id')
        .join('drivers as d', 'rs.driver_id', 'd.id')
        .where('rs.week_id', week.id)
        .where('rt.day_col', dayCol)
        .where('rt.to_depot', depot)
        .where('rt.assigned_code', group.linked_shift_code)
        .where('d.status', 'Active')
        .select('d.id as driver_id');

      drivers.push(...transferredIn);

      // Get existing rows for this group
      const existingRows = await db('plan_am_rows')
        .where({ group_id: group.id })
        .select('driver_id');
      const existingDriverIds = new Set(existingRows.map((r) => r.driver_id));

      // Add new drivers that aren't already in the group
      const newRows = drivers
        .filter((d) => !existingDriverIds.has(d.driver_id))
        .map((d, i) => ({
          id: uuid(),
          group_id: group.id,
          driver_id: d.driver_id,
          sort_order: existingRows.length + i,
        }));

      if (newRows.length > 0) {
        await db('plan_am_rows').insert(newRows);
        totalDriversAdded += newRows.length;
      }
    }

    res.json({ groups: groups.length, drivers: totalDriversAdded });
  } catch (err) {
    next(err);
  }
}
