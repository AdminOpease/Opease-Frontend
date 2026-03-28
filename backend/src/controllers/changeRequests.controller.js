import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function create(req, res, next) {
  try {
    const request = await insertAndReturn('change_requests', req.body);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status, driverId, page, limit } = req.query;
    let query = db('change_requests as cr')
      .join('drivers as d', 'cr.driver_id', 'd.id')
      .select('cr.*', 'd.first_name', 'd.last_name', 'd.email')
      .orderBy('cr.created_at', 'desc');

    if (status) query = query.where('cr.status', status);
    if (driverId) query = query.where('cr.driver_id', driverId);

    const result = await paginate(query, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function review(req, res, next) {
  try {
    const { status } = req.body;
    const cr = await db('change_requests').where({ id: req.params.id }).first();
    if (!cr) throw new NotFoundError('Change Request');

    const updated = await updateAndReturn('change_requests', { id: req.params.id }, {
      status,
      reviewed_by: req.user?.sub || null,
      reviewed_at: new Date(),
      updated_at: new Date(),
    });

    if (status === 'Approved') {
      const fieldMap = {
        'account.email': 'email',
        'account.phone': 'phone',
        'emergency.name': 'emergency_name',
        'emergency.relationship': 'emergency_relationship',
        'emergency.phone': 'emergency_phone',
        'emergency.email': 'emergency_email',
        'payment.bank_name': 'bank_name',
        'payment.sort_code': 'sort_code',
        'payment.account_number': 'account_number',
        'payment.tax_reference': 'tax_reference',
        'payment.vat_number': 'vat_number',
      };

      const column = fieldMap[`${cr.section}.${cr.field_name}`];
      if (column) {
        await db('drivers')
          .where({ id: cr.driver_id })
          .update({ [column]: cr.new_value, updated_at: new Date() });
      }

      await db('notifications').insert({
        driver_id: cr.driver_id,
        type: 'communication',
        title: 'Change Request Approved',
        body: `Your request to change ${cr.field_name} has been approved.`,
      });
    } else {
      await db('notifications').insert({
        driver_id: cr.driver_id,
        type: 'communication',
        title: 'Change Request Rejected',
        body: `Your request to change ${cr.field_name} has been rejected.`,
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
