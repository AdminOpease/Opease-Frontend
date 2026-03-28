import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('applications').del();

  const drivers = await knex('drivers')
    .whereIn('status', ['Onboarding', 'Inactive', 'Offboarded'])
    .select('id', 'email', 'status');

  const today = new Date().toISOString().slice(0, 10);

  const apps = drivers.map((d) => ({
    id: uuid(),
    driver_id: d.id,
    date_applied: today,
    pre_dcc: 'In Review',
    account_id: d.email,
    dl_verification: 'Pending',
    bgc: 'Pending',
    contract_signing: 'Pending',
  }));

  if (apps.length > 0) {
    await knex('applications').insert(apps);
  }
}
