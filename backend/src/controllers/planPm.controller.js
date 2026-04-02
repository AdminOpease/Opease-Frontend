import { v4 as uuid } from 'uuid';
import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

const DAY_COLS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const DEFAULT_PM_SECTIONS = [
  { title: 'Same Day', time: '14:00', linked_shift_code: 'SD' },
  { title: 'SWA', time: '14:30', linked_shift_code: 'SWA' },
  { title: 'Full Routes', time: '15:00', linked_shift_code: 'W' },
];

export async function list(req, res, next) {
  try {
    const { date, depot } = req.query;
    const sections = await db('plan_pm_sections')
      .where({ plan_date: date, depot })
      .orderBy('sort_order', 'asc');

    const sectionIds = sections.map((s) => s.id);
    const drivers = sectionIds.length
      ? await db('plan_pm_drivers as pd')
          .leftJoin('drivers as d', 'pd.driver_id', 'd.id')
          .select('pd.*', 'd.first_name', 'd.last_name', 'd.amazon_id', 'd.transporter_id')
          .whereIn('pd.section_id', sectionIds)
          .orderBy('pd.sort_order', 'asc')
      : [];

    const driversBySection = {};
    for (const d of drivers) {
      if (!driversBySection[d.section_id]) driversBySection[d.section_id] = [];
      driversBySection[d.section_id].push(d);
    }

    const data = sections.map((s) => ({
      ...s,
      drivers: driversBySection[s.id] || [],
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createSection(req, res, next) {
  try {
    const section = await insertAndReturn('plan_pm_sections', req.body);
    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
}

export async function updateSection(req, res, next) {
  try {
    const section = await updateAndReturn('plan_pm_sections', { id: req.params.id }, req.body);
    if (!section) throw new NotFoundError('PM Plan Section');
    res.json(section);
  } catch (err) {
    next(err);
  }
}

export async function deleteSection(req, res, next) {
  try {
    const deleted = await db('plan_pm_sections').where({ id: req.params.id }).del();
    if (!deleted) throw new NotFoundError('PM Plan Section');
    res.json({ message: 'Section deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addDriver(req, res, next) {
  try {
    const { driver_id, sort_order } = req.body;
    const entry = await insertAndReturn('plan_pm_drivers', {
      section_id: req.params.id,
      driver_id,
      sort_order: sort_order || 0,
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function removeDriver(req, res, next) {
  try {
    const deleted = await db('plan_pm_drivers')
      .where({ section_id: req.params.sectionId, driver_id: req.params.driverId })
      .del();
    if (!deleted) throw new NotFoundError('PM Plan Driver');
    res.json({ message: 'Driver removed from section' });
  } catch (err) {
    next(err);
  }
}

export async function generateFromRota(req, res, next) {
  try {
    const { date, depot } = req.body;

    const week = await db('rota_weeks')
      .where('start_date', '<=', date)
      .where('end_date', '>=', date)
      .first();

    if (!week) {
      return res.json({ message: 'No rota week found for this date', sections: 0, drivers: 0 });
    }

    const dateObj = new Date(date + 'T12:00:00Z');
    const dayCol = DAY_COLS[dateObj.getUTCDay()];

    const sections = await db('plan_pm_sections')
      .where({ plan_date: date, depot })
      .orderBy('sort_order', 'asc');

    if (sections.length === 0) {
      return res.json({ sections: 0, drivers: 0, message: 'No sections configured for this date. Add sections first.' });
    }

    let totalDriversAdded = 0;

    for (const section of sections) {
      if (!section.linked_shift_code) continue;

      const drivers = await db('rota_schedule as rs')
        .join('drivers as d', 'rs.driver_id', 'd.id')
        .where('rs.week_id', week.id)
        .where(`rs.${dayCol}`, section.linked_shift_code)
        .where('d.depot', depot)
        .where('d.status', 'Active')
        .select('d.id as driver_id');

      // Also include drivers transferred INTO this depot with matching assigned_code
      const transferredIn = await db('rota_transfers as rt')
        .join('rota_schedule as rs', 'rt.schedule_id', 'rs.id')
        .join('drivers as d', 'rs.driver_id', 'd.id')
        .where('rs.week_id', week.id)
        .where('rt.day_col', dayCol)
        .where('rt.to_depot', depot)
        .where('rt.assigned_code', section.linked_shift_code)
        .where('d.status', 'Active')
        .select('d.id as driver_id');

      drivers.push(...transferredIn);

      const existingDrivers = await db('plan_pm_drivers')
        .where({ section_id: section.id })
        .select('driver_id');
      const existingIds = new Set(existingDrivers.map((d) => d.driver_id));

      const newDrivers = drivers
        .filter((d) => !existingIds.has(d.driver_id))
        .map((d, i) => ({
          id: uuid(),
          section_id: section.id,
          driver_id: d.driver_id,
          sort_order: existingDrivers.length + i,
        }));

      if (newDrivers.length > 0) {
        await db('plan_pm_drivers').insert(newDrivers);
        totalDriversAdded += newDrivers.length;
      }
    }

    res.json({ sections: sections.length, drivers: totalDriversAdded });
  } catch (err) {
    next(err);
  }
}
