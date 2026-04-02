import db from '../config/database.js';
import { v4 as uuid } from 'uuid';

export async function list(req, res, next) {
  try {
    const stations = await db('stations')
      .where({ active: true })
      .orderBy('name', 'asc');
    res.json({ data: stations });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { code, name, region } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'code and name are required' });
    const id = uuid();
    await db('stations').insert({ id, code, name, region: region || null, active: true });
    const station = await db('stations').where({ id }).first();
    res.status(201).json(station);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, region, active } = req.body;
    const patch = {};
    if (code !== undefined) patch.code = code;
    if (name !== undefined) patch.name = name;
    if (region !== undefined) patch.region = region;
    if (active !== undefined) patch.active = active;
    await db('stations').where({ id }).update(patch);
    const station = await db('stations').where({ id }).first();
    res.json(station);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await db('stations').where({ id }).delete();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
