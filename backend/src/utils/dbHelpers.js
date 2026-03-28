import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

/**
 * SQLite-compatible update that returns the updated row.
 * PostgreSQL supports .returning('*') but SQLite does not.
 */
export async function updateAndReturn(table, where, data) {
  const count = await db(table).where(where).update(data);
  if (!count) return null;
  return db(table).where(where).first();
}

/**
 * SQLite-compatible insert that returns the inserted row.
 * Auto-generates UUID if no id is provided.
 */
export async function insertAndReturn(table, data) {
  const row = data.id ? data : { id: uuidv4(), ...data };
  await db(table).insert(row);
  return db(table).where({ id: row.id }).first();
}
