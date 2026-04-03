import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  const existing = await knex('portal_users').where({ email: 'admin@opease.co.uk' }).first();
  if (existing) return;

  const hash = await bcrypt.hash('admin123', 10);
  await knex('portal_users').insert({
    id: uuid(),
    email: 'admin@opease.co.uk',
    password_hash: hash,
    first_name: 'Admin',
    last_name: 'OpEase',
    is_super_admin: true,
    is_active: true,
  });
}
