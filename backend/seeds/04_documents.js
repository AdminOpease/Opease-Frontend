import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('documents').del();

  const amy = await knex('drivers').where({ email: 'amy.jones@opease.co.uk' }).first();
  const ben = await knex('drivers').where({ email: 'ben.carter@opease.co.uk' }).first();
  const dan = await knex('drivers').where({ email: 'dan.okafor@opease.co.uk' }).first();

  if (!amy || !ben || !dan) return;

  await knex('documents').insert([
    { id: uuid(), driver_id: amy.id, title: 'Amy Licence', type: 'Licence', s3_key: 'demo/amy-licence.pdf', file_name: 'amy-licence.pdf', expiry_date: '2026-09-15' },
    { id: uuid(), driver_id: amy.id, title: 'Amy DVLA', type: 'DVLA', s3_key: 'demo/amy-dvla.pdf', file_name: 'amy-dvla.pdf', expiry_date: '2026-03-20' },
    { id: uuid(), driver_id: ben.id, title: 'Ben Right to Work', type: 'Right to Work', s3_key: 'demo/ben-rtw.pdf', file_name: 'ben-rtw.pdf', expiry_date: '2026-10-01' },
    { id: uuid(), driver_id: dan.id, title: 'Dan Licence', type: 'Licence', s3_key: 'demo/dan-licence.pdf', file_name: 'dan-licence.pdf', expiry_date: '2026-02-10' },
  ]);
}
