import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('stations').del();

  await knex('stations').insert([
    { id: uuid(), code: 'DLU2', name: 'DLU2', region: 'London' },
    { id: uuid(), code: 'LHR', name: 'Heathrow', region: 'London' },
    { id: uuid(), code: 'GRN', name: 'Greenwich', region: 'London' },
    { id: uuid(), code: 'BAT', name: 'Battersea', region: 'London' },
  ]);
}
