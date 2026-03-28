import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';

export async function list(req, res, next) {
  try {
    const { depot, status, search, page, limit } = req.query;
    let query = db('drivers').select('*').orderBy('created_at', 'desc');

    if (depot && depot !== 'All Depots') query = query.where('depot', depot);
    if (status) query = query.where('status', status);
    if (search) {
      query = query.where(function () {
        this.whereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('phone', `%${search}%`)
          .orWhereILike('amazon_id', `%${search}%`);
      });
    }

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const driver = await db('drivers').where({ id: req.params.id }).first();
    if (!driver) throw new NotFoundError('Driver');

    // Get application
    const application = await db('applications').where({ driver_id: driver.id }).first();
    // Get documents
    const documents = await db('documents')
      .where({ driver_id: driver.id })
      .whereNull('deleted_at')
      .orderBy('uploaded_at', 'desc');

    res.json({ driver, application, documents });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const [driver] = await db('drivers')
      .where({ id: req.params.id })
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');
    if (!driver) throw new NotFoundError('Driver');
    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const [driver] = await db('drivers')
      .where({ id: req.params.id })
      .update({ status: req.body.status, updated_at: new Date() })
      .returning('*');
    if (!driver) throw new NotFoundError('Driver');
    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const [driver] = await db('drivers')
      .where({ id: req.params.id })
      .update({ status: 'Offboarded', updated_at: new Date() })
      .returning('*');
    if (!driver) throw new NotFoundError('Driver');
    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function restore(req, res, next) {
  try {
    const [driver] = await db('drivers')
      .where({ id: req.params.id })
      .update({ status: 'Active', updated_at: new Date() })
      .returning('*');
    if (!driver) throw new NotFoundError('Driver');
    res.json(driver);
  } catch (err) {
    next(err);
  }
}
