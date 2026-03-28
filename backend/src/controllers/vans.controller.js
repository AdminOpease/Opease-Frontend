import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function list(req, res, next) {
  try {
    const { station, make, page, limit } = req.query;
    let query = db('vans').select('*').orderBy('registration', 'asc');

    if (station && station !== 'All Depots') query = query.where('station', station);
    if (make) query = query.where('make', make);

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const van = await insertAndReturn('vans', req.body);
    res.status(201).json(van);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const van = await updateAndReturn('vans', { id: req.params.id }, {
      ...req.body,
      updated_at: new Date(),
    });
    if (!van) throw new NotFoundError('Van');
    res.json(van);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await db('vans').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('Van');
    res.json({ message: 'Van deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(req, res, next) {
  try {
    const { startDate, endDate, depot, driverId } = req.query;
    let query = db('van_assignments as va')
      .join('drivers as d', 'va.driver_id', 'd.id')
      .join('vans as v', 'va.van_id', 'v.id')
      .select(
        'va.*',
        'd.first_name', 'd.last_name', 'd.amazon_id',
        'v.registration', 'v.make'
      )
      .orderBy('va.assign_date', 'asc');

    if (startDate) query = query.where('va.assign_date', '>=', startDate);
    if (endDate) query = query.where('va.assign_date', '<=', endDate);
    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);
    if (driverId) query = query.where('va.driver_id', driverId);

    const data = await query;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const { driver_id, van_id, assign_date } = req.body;

    const existing = await db('van_assignments')
      .where({ driver_id, assign_date })
      .first();

    let assignment;
    if (existing) {
      assignment = await updateAndReturn('van_assignments', { id: existing.id }, { van_id });
    } else {
      assignment = await insertAndReturn('van_assignments', { driver_id, van_id, assign_date });
    }

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignment(req, res, next) {
  try {
    const deleted = await db('van_assignments').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('Van Assignment');
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}
