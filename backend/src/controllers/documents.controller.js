import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function list(req, res, next) {
  try {
    const { driverId, type, expiring, includeDeleted, page, limit } = req.query;
    let query = db('documents as doc')
      .leftJoin('drivers as d', 'doc.driver_id', 'd.id')
      .select('doc.*', 'd.first_name', 'd.last_name', 'd.email as driver_email', 'd.depot')
      .orderBy('doc.uploaded_at', 'desc');

    if (!includeDeleted) query = query.whereNull('doc.deleted_at');
    if (driverId) query = query.where('doc.driver_id', driverId);
    if (type) query = query.where('doc.type', type);

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getExpiring(req, res, next) {
  try {
    const { depot } = req.query;
    const today = new Date().toISOString().slice(0, 10);

    let query = db('documents as doc')
      .join('drivers as d', 'doc.driver_id', 'd.id')
      .select(
        'doc.*',
        'd.first_name', 'd.last_name', 'd.email as driver_email', 'd.depot',
        db.raw(`cast(julianday(doc.expiry_date) - julianday(date('now')) as integer) as days_remaining`)
      )
      .whereNull('doc.deleted_at')
      .whereNull('doc.archived_at')
      .whereNotNull('doc.expiry_date')
      .where('doc.expiry_date', '>=', today)
      .where(function () {
        this.where(function () {
          this.where('doc.type', 'DVLA')
            .whereRaw(`cast(julianday(doc.expiry_date) - julianday(date('now')) as integer) <= 7`);
        }).orWhere(function () {
          this.whereNot('doc.type', 'DVLA')
            .whereRaw(`cast(julianday(doc.expiry_date) - julianday(date('now')) as integer) <= 30`);
        });
      })
      .orderBy('days_remaining', 'asc');

    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);

    const data = await query;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await insertAndReturn('documents', req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const existing = await db('documents').where({ id: req.params.id }).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Document');
    const doc = await updateAndReturn('documents', { id: req.params.id }, req.body);
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function archive(req, res, next) {
  try {
    const existing = await db('documents').where({ id: req.params.id }).first();
    if (!existing) throw new NotFoundError('Document');
    const doc = await updateAndReturn('documents', { id: req.params.id }, { archived_at: new Date() });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function restore(req, res, next) {
  try {
    const existing = await db('documents').where({ id: req.params.id }).first();
    if (!existing) throw new NotFoundError('Document');
    const doc = await updateAndReturn('documents', { id: req.params.id }, { archived_at: null, deleted_at: null });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const existing = await db('documents').where({ id: req.params.id }).first();
    if (!existing) throw new NotFoundError('Document');
    const doc = await updateAndReturn('documents', { id: req.params.id }, { deleted_at: new Date() });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}
