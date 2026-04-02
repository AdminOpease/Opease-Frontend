import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn } from '../utils/dbHelpers.js';

export async function create(req, res, next) {
  try {
    const {
      first_name, last_name, email, phone, depot, status,
      amazon_id, transporter_id,
    } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ error: 'first_name, last_name and email are required' });
    }

    // Check if email already exists
    const existing = await db('drivers').where({ email: email.toLowerCase() }).first();
    if (existing) {
      return res.status(409).json({ error: 'A driver with this email already exists' });
    }

    const driver = await insertAndReturn('drivers', {
      first_name,
      last_name,
      email: email.toLowerCase(),
      phone: phone || null,
      depot: depot || null,
      status: status || 'Active',
      amazon_id: amazon_id || null,
      transporter_id: transporter_id || null,
    });

    res.status(201).json(driver);
  } catch (err) {
    next(err);
  }
}

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
    const driverId = req.params.id;
    const [driver] = await db('drivers')
      .where({ id: driverId })
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');
    if (!driver) throw new NotFoundError('Driver');

    // When driver goes Inactive or Offboarded, remove FUTURE rota entries (keep current week + past)
    if (req.body.status === 'Inactive' || req.body.status === 'Offboarded') {
      // Find the current week (the one whose date range includes today)
      const today = new Date().toISOString().slice(0, 10);
      const currentWeek = await db('rota_weeks')
        .where('start_date', '<=', today)
        .where('end_date', '>=', today)
        .first();

      if (currentWeek) {
        // Get all future week IDs (after current week)
        const futureWeeks = await db('rota_weeks')
          .where('start_date', '>', currentWeek.end_date)
          .select('id');
        const futureWeekIds = futureWeeks.map((w) => w.id);

        if (futureWeekIds.length > 0) {
          // Remove future rota_schedule entries
          await db('rota_schedule')
            .where({ driver_id: driverId })
            .whereIn('week_id', futureWeekIds)
            .del();

          // Remove future availability requests
          await db('rota_availability')
            .where({ driver_id: driverId })
            .whereIn('week_id', futureWeekIds)
            .del();
        }
      }
    }

    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const driverId = req.params.id;
    const newStatus = req.body.status;

    const count = await db('drivers')
      .where({ id: driverId })
      .update({ status: newStatus, updated_at: new Date() });
    if (!count) throw new NotFoundError('Driver');
    const driver = await db('drivers').where({ id: driverId }).first();

    const today = new Date().toISOString().slice(0, 10);

    // ── Inactive / Offboarded: remove future rota, plans, transfers ──
    if (newStatus === 'Inactive' || newStatus === 'Offboarded') {
      const currentWeek = await db('rota_weeks')
        .where('start_date', '<=', today)
        .where('end_date', '>=', today)
        .first();

      if (currentWeek) {
        const futureWeeks = await db('rota_weeks')
          .where('start_date', '>', currentWeek.end_date)
          .select('id');
        const futureWeekIds = futureWeeks.map((w) => w.id);

        if (futureWeekIds.length > 0) {
          // Remove future rota_schedule (cascades to rota_transfers via FK)
          await db('rota_schedule')
            .where({ driver_id: driverId })
            .whereIn('week_id', futureWeekIds)
            .del();

          // Remove future availability
          await db('rota_availability')
            .where({ driver_id: driverId })
            .whereIn('week_id', futureWeekIds)
            .del();
        }
      }

      // Remove from future plan_am_rows
      const futureAmRows = await db('plan_am_rows as r')
        .join('plan_am_groups as g', 'r.group_id', 'g.id')
        .where('r.driver_id', driverId)
        .where('g.plan_date', '>', today)
        .select('r.id');
      if (futureAmRows.length > 0) {
        await db('plan_am_rows').whereIn('id', futureAmRows.map((r) => r.id)).del();
      }

      // Remove from future plan_pm_drivers
      const futurePmRows = await db('plan_pm_drivers as pd')
        .join('plan_pm_sections as s', 'pd.section_id', 's.id')
        .where('pd.driver_id', driverId)
        .where('s.plan_date', '>', today)
        .select('pd.id');
      if (futurePmRows.length > 0) {
        await db('plan_pm_drivers').whereIn('id', futurePmRows.map((r) => r.id)).del();
      }
    }

    // ── Onboarding: reset application for re-onboarding ──
    if (newStatus === 'Onboarding') {
      await db('applications')
        .where({ driver_id: driverId })
        .update({
          activated_at: null,
          removed_at: null,
          removed_comment: null,
          pre_dcc: 'In Review',
          dl_verification: 'Pending',
          bgc: 'Pending',
          driving_test_slots: null,
          driving_test_result: null,
          training_slots: null,
          training_message: null,
          training_booked: null,
          training_result: null,
          dcc_date: null,
          contract_signing: null,
          flex_confirmed: false,
          dl_confirmed: false,
          fir_missing_docs: null,
          updated_at: new Date(),
        });
    }

    // ── Active: ensure rota_schedule exists for current week ──
    if (newStatus === 'Active') {
      const currentWeek = await db('rota_weeks')
        .where('start_date', '<=', today)
        .where('end_date', '>=', today)
        .first();

      if (currentWeek) {
        const existing = await db('rota_schedule')
          .where({ driver_id: driverId, week_id: currentWeek.id })
          .first();

        if (!existing) {
          await insertAndReturn('rota_schedule', {
            driver_id: driverId,
            week_id: currentWeek.id,
            sun: '', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '',
          });
        }
      }
    }

    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    // Delegate to updateStatus with Offboarded status for full cascade
    req.body = { status: 'Offboarded' };
    return updateStatus(req, res, next);
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
