import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

export async function submit(req, res, next) {
  try {
    const {
      email, firstName, lastName, phone, station,
      licenceNumber, licenceExpiry, licenceCountry, dateTestPassed,
      idDocumentType, idExpiry, passportCountry,
      rightToWork, shareCode, niNumber,
      addressLine1, addressLine2, town, county, postcode,
    } = req.body;

    let driver = await db('drivers').where({ email }).first();
    if (!driver) {
      driver = await insertAndReturn('drivers', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        depot: station || null,
        status: 'Onboarding',
        licence_number: licenceNumber,
        licence_expiry: licenceExpiry || null,
        licence_country: licenceCountry,
        date_test_passed: dateTestPassed || null,
        id_document_type: idDocumentType,
        id_expiry: idExpiry || null,
        passport_country: passportCountry,
        right_to_work: rightToWork,
        share_code: shareCode,
        ni_number: niNumber,
        address_line1: addressLine1,
        address_line2: addressLine2,
        town,
        county,
        postcode,
      });
    } else {
      driver = await updateAndReturn('drivers', { id: driver.id }, {
        first_name: firstName,
        last_name: lastName,
        phone,
        depot: station || driver.depot,
        licence_number: licenceNumber || driver.licence_number,
        licence_expiry: licenceExpiry || driver.licence_expiry,
        licence_country: licenceCountry || driver.licence_country,
        date_test_passed: dateTestPassed || driver.date_test_passed,
        id_document_type: idDocumentType || driver.id_document_type,
        id_expiry: idExpiry || driver.id_expiry,
        passport_country: passportCountry || driver.passport_country,
        right_to_work: rightToWork || driver.right_to_work,
        share_code: shareCode || driver.share_code,
        ni_number: niNumber || driver.ni_number,
        address_line1: addressLine1 || driver.address_line1,
        address_line2: addressLine2 || driver.address_line2,
        town: town || driver.town,
        county: county || driver.county,
        postcode: postcode || driver.postcode,
        updated_at: new Date(),
      });
    }

    let application = await db('applications').where({ driver_id: driver.id }).first();
    if (!application) {
      application = await insertAndReturn('applications', {
        driver_id: driver.id,
        date_applied: new Date().toISOString().slice(0, 10),
      });
    }

    res.status(201).json({ driver, application });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { phase, depot, page, limit } = req.query;
    let query = db('applications as a')
      .join('drivers as d', 'a.driver_id', 'd.id')
      .select(
        'a.*',
        'd.first_name', 'd.last_name', 'd.email', 'd.phone',
        'd.depot', 'd.status as driver_status', 'd.amazon_id'
      )
      .orderBy('a.date_applied', 'desc');

    if (depot && depot !== 'All Depots') query = query.where('d.depot', depot);

    if (phase === 1 || phase === '1') {
      query = query
        .where('a.bgc', 'Pending')
        .whereNull('a.training_date')
        .whereNot('a.contract_signing', 'Complete')
        .whereNull('a.dcc_date')
        .whereNull('a.activated_at')
        .whereNull('a.removed_at');
    } else if (phase === 2 || phase === '2') {
      query = query
        .whereNull('a.activated_at')
        .whereNull('a.removed_at')
        .where(function () {
          this.whereNot('a.bgc', 'Pending')
            .orWhereNotNull('a.training_date')
            .orWhere('a.contract_signing', 'Complete')
            .orWhereNotNull('a.dcc_date');
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
    const application = await db('applications as a')
      .join('drivers as d', 'a.driver_id', 'd.id')
      .select('a.*', 'd.first_name', 'd.last_name', 'd.email', 'd.phone', 'd.depot', 'd.status as driver_status')
      .where('a.id', req.params.id)
      .first();
    if (!application) throw new NotFoundError('Application');
    res.json(application);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await updateAndReturn('applications', { id: req.params.id }, {
      ...req.body,
      updated_at: new Date(),
    });
    if (!updated) throw new NotFoundError('Application');

    // When DL verification fails, reset confirmations so driver must re-confirm after retry
    if (req.body.dl_verification === 'Fail') {
      await db('applications')
        .where({ id: req.params.id })
        .update({ flex_confirmed: false, dl_confirmed: false });
    }

    // Sync account_id to drivers.amazon_id so it reflects on driver profile & candidate-portal
    if (req.body.account_id !== undefined) {
      await db('drivers')
        .where({ id: updated.driver_id })
        .update({ amazon_id: req.body.account_id, updated_at: new Date() });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function activate(req, res, next) {
  try {
    const application = await db('applications').where({ id: req.params.id }).first();
    if (!application) throw new NotFoundError('Application');

    const updated = await updateAndReturn('applications', { id: req.params.id }, {
      activated_at: new Date(),
      updated_at: new Date(),
    });

    await db('drivers')
      .where({ id: application.driver_id })
      .update({ status: 'Active', updated_at: new Date() });

    await insertAndReturn('notifications', {
      driver_id: application.driver_id,
      type: 'communication',
      title: 'Account Activated',
      body: 'Your account has been activated. Welcome to the team!',
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function removeApp(req, res, next) {
  try {
    const { comment } = req.body;
    const application = await db('applications').where({ id: req.params.id }).first();
    if (!application) throw new NotFoundError('Application');

    const updated = await updateAndReturn('applications', { id: req.params.id }, {
      removed_at: new Date(),
      removed_comment: comment || null,
      updated_at: new Date(),
    });

    await db('drivers')
      .where({ id: application.driver_id })
      .update({ status: 'Offboarded', updated_at: new Date() });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// Candidate confirms they completed the flex app setup
export async function confirmFlex(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) throw new NotFoundError('Driver not found');

    const app = await db('applications').where({ driver_id: driver.id }).first();
    if (!app) throw new NotFoundError('Application not found');

    const [updated] = await db('applications')
      .where({ id: app.id })
      .update({ flex_confirmed: true, updated_at: new Date() })
      .returning('*');

    res.json(updated || { ...app, flex_confirmed: true });
  } catch (err) {
    next(err);
  }
}

// Candidate confirms they retried DL verification
export async function confirmDl(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) throw new NotFoundError('Driver not found');

    const app = await db('applications').where({ driver_id: driver.id }).first();
    if (!app) throw new NotFoundError('Application not found');

    const [updated] = await db('applications')
      .where({ id: app.id })
      .update({ dl_confirmed: true, updated_at: new Date() })
      .returning('*');

    res.json(updated || { ...app, dl_confirmed: true });
  } catch (err) {
    next(err);
  }
}

// Candidate books a driving test slot
export async function bookDrivingTest(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) throw new NotFoundError('Driver not found');

    const app = await db('applications').where({ driver_id: driver.id }).first();
    if (!app) throw new NotFoundError('Application not found');

    // Check not already booked
    try {
      const existing = JSON.parse(app.contract_signing || '');
      if (existing && existing.date && existing.time) {
        return res.status(409).json({ error: 'Driving test already booked' });
      }
    } catch { /* not booked yet */ }

    // Validate slot exists in available slots
    const slots = app.driving_test_slots ? JSON.parse(app.driving_test_slots) : [];
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ error: 'date and time are required' });
    }
    const match = slots.find((s) => s.date === date && s.time === time);
    if (!match) {
      return res.status(400).json({ error: 'Selected slot is not available' });
    }

    const bookedSlot = JSON.stringify({ date, time });
    const [updated] = await db('applications')
      .where({ id: app.id })
      .update({ contract_signing: bookedSlot, updated_at: new Date() })
      .returning('*');

    res.json(updated || { ...app, contract_signing: bookedSlot });
  } catch (err) {
    next(err);
  }
}

// Candidate books a training slot
export async function bookTraining(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) throw new NotFoundError('Driver not found');

    const app = await db('applications').where({ driver_id: driver.id }).first();
    if (!app) throw new NotFoundError('Application not found');

    // Check not already booked
    try {
      const existing = JSON.parse(app.training_booked || '');
      if (existing && existing.date && existing.time) {
        return res.status(409).json({ error: 'Training already booked' });
      }
    } catch { /* not booked yet */ }

    // Validate slot exists in available slots
    const slots = app.training_slots ? JSON.parse(app.training_slots) : [];
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ error: 'date and time are required' });
    }
    const match = slots.find((s) => s.date === date && s.time === time);
    if (!match) {
      return res.status(400).json({ error: 'Selected slot is not available' });
    }

    const bookedSlot = JSON.stringify({ date, time });
    const [updated] = await db('applications')
      .where({ id: app.id })
      .update({ training_booked: bookedSlot, updated_at: new Date() })
      .returning('*');

    res.json(updated || { ...app, training_booked: bookedSlot });
  } catch (err) {
    next(err);
  }
}
