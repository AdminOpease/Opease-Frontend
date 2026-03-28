import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function list(req, res, next) {
  try {
    const { driverId, unreadOnly, page, limit } = req.query;
    const targetDriverId = driverId || req.user?.driverId;

    let query = db('notifications').orderBy('created_at', 'desc');
    if (targetDriverId) query = query.where('driver_id', targetDriverId);
    if (unreadOnly) query = query.where('is_read', false);

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await updateAndReturn('notifications', { id: req.params.id }, { is_read: true });
    if (!notification) throw new NotFoundError('Notification');
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const notification = await insertAndReturn('notifications', req.body);
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
}
