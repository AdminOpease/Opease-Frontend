import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

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
          .select('r.*', 'd.first_name', 'd.last_name', 'd.amazon_id')
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
