import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function list(req, res, next) {
  try {
    const { date, depot, driverId, page, limit } = req.query;
    let query = db('working_hours as wh')
      .leftJoin('drivers as d', 'wh.driver_id', 'd.id')
      .select('wh.*', 'd.first_name', 'd.last_name', 'd.amazon_id')
      .orderBy('wh.start_time', 'asc');

    if (date) query = query.where('wh.work_date', date);
    if (depot && depot !== 'All Depots') query = query.where('wh.depot', depot);
    if (driverId) query = query.where('wh.driver_id', driverId);

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const entry = await insertAndReturn('working_hours', req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const entry = await updateAndReturn('working_hours', { id: req.params.id }, {
      ...req.body,
      updated_at: new Date(),
    });
    if (!entry) throw new NotFoundError('Working Hours');
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await db('working_hours').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('Working Hours');
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
}

export async function importData(req, res, next) {
  try {
    const { work_date, depot, rows } = req.body;
    let created = 0;

    for (const row of rows) {
      let driverId = row.driver_id;

      if (!driverId && row.driver_name) {
        const parts = row.driver_name.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        const driver = await db('drivers')
          .where('first_name', 'like', firstName)
          .where('last_name', 'like', lastName || '%')
          .first();
        if (driver) driverId = driver.id;
      }

      await db('working_hours').insert({
        driver_id: driverId || null,
        work_date,
        depot,
        vehicle: row.vehicle || null,
        route_number: row.route_number || null,
        start_time: row.start_time || null,
        finish_time: row.finish_time || null,
        breaks: row.breaks || null,
        stops: row.stops || null,
        comments: row.comments || null,
      });
      created++;
    }

    res.json({ created, total: rows.length });
  } catch (err) {
    next(err);
  }
}
