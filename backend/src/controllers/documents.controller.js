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

function parseDate(val) {
  if (!val) return null;
  // Handle Unix ms timestamps (numbers or numeric strings)
  const n = typeof val === 'string' ? Number(val) : val;
  if (typeof n === 'number' && !isNaN(n) && n > 1e9) return new Date(n);
  // Handle ISO/date strings
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil(val) {
  const d = parseDate(val);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

function addMonths(val, months) {
  const d = parseDate(val);
  if (!d) return null;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export async function getExpiring(req, res, next) {
  try {
    const { depot } = req.query;

    let query = db('drivers').where({ status: 'Active' });
    if (depot && depot !== 'All Depots') query = query.where('depot', depot);
    const drivers = await query;

    const rows = [];
    for (const d of drivers) {
      const base = {
        driver_id: d.id,
        driver_name: [d.first_name, d.last_name].filter(Boolean).join(' '),
        driver_email: d.email,
        driver_phone: d.phone,
        depot: d.depot,
      };

      // Licence expiry (30-day window)
      if (d.licence_expiry) {
        const parsed = parseDate(d.licence_expiry);
        const expiryStr = parsed ? parsed.toISOString().slice(0, 10) : null;
        const days = daysUntil(d.licence_expiry);
        if (days !== null && days <= 30) {
          rows.push({ ...base, type: 'Licence', expiry_date: expiryStr, days_remaining: days });
        }
      }

      // DVLA Check (3-month cycle, 30-day window)
      if (d.last_dvla_check) {
        const dvlaExpiry = addMonths(d.last_dvla_check, 3);
        if (dvlaExpiry) {
          const days = daysUntil(dvlaExpiry);
          if (days !== null && days <= 30) {
            rows.push({
              ...base, type: 'DVLA', expiry_date: dvlaExpiry, days_remaining: days,
              dvla_check_code: d.dvla_check_code || null,
              dvla_code_submitted_at: d.dvla_code_submitted_at || null,
            });
          }
        }
      }

      // Right to Work — any type with visa_expiry set (Share Code, Visa, Pre-Settled Status)
      if (d.right_to_work && !['British Passport', 'Birth Certificate'].includes(d.right_to_work) && d.visa_expiry) {
        const rtwParsed = parseDate(d.visa_expiry);
        const rtwExpiryStr = rtwParsed ? rtwParsed.toISOString().slice(0, 10) : null;
        const days = daysUntil(d.visa_expiry);
        if (days !== null && days <= 30) {
          rows.push({
            ...base, type: 'Right to Work', expiry_date: rtwExpiryStr, days_remaining: days,
            rtw_share_code_new: d.rtw_share_code_new || null,
            rtw_code_submitted_at: d.rtw_code_submitted_at || null,
          });
        }
      }
    }

    rows.sort((a, b) => a.days_remaining - b.days_remaining);
    res.json({ data: rows });
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
