import db from '../config/database.js';

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
