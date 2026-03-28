import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { insertAndReturn, updateAndReturn } from '../utils/dbHelpers.js';

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
          .select('pd.*', 'd.first_name', 'd.last_name', 'd.amazon_id')
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
