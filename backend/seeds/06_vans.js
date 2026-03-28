import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('van_assignments').del();
  await knex('vans').del();

  const vans = [
    { id: uuid(), registration: 'AOG', make: 'Ford', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'NZC', make: 'Ford', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'WJR', make: 'Sprinter', station: 'DLU2', transmission: 'Auto' },
    { id: uuid(), registration: 'KMV', make: 'Citroen', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'LPF', make: 'Ford', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'RXD', make: 'Maxus', station: 'DLU2', transmission: 'Auto' },
    { id: uuid(), registration: 'TQB', make: 'Peugeot', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'YHN', make: 'Ford', station: 'DLU2', transmission: 'Manual' },
    { id: uuid(), registration: 'BFG', make: 'Sprinter', station: 'Greenwich', transmission: 'Auto' },
    { id: uuid(), registration: 'DMK', make: 'Ford', station: 'Greenwich', transmission: 'Manual' },
    { id: uuid(), registration: 'HCV', make: 'Vivaro', station: 'Greenwich', transmission: 'Manual' },
    { id: uuid(), registration: 'JWS', make: 'Ford', station: 'Greenwich', transmission: 'Manual' },
    { id: uuid(), registration: 'PNR', make: 'Citroen', station: 'Greenwich', transmission: 'Manual' },
    { id: uuid(), registration: 'FTL', make: 'Ford', station: 'Heathrow', transmission: 'Manual' },
    { id: uuid(), registration: 'GKM', make: 'Maxus', station: 'Heathrow', transmission: 'Auto' },
    { id: uuid(), registration: 'QZX', make: 'Sprinter', station: 'Battersea', transmission: 'Auto' },
    { id: uuid(), registration: 'VCW', make: 'Ford', station: 'Battersea', transmission: 'Manual' },
    { id: uuid(), registration: 'XEB', make: 'Peugeot', station: 'Battersea', transmission: 'Manual' },
  ];

  await knex('vans').insert(vans);
}
