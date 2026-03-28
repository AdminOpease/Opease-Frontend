import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('change_requests').del();
  await knex('notifications').del();
  await knex('contracts').del();
  await knex('working_hours').del();
  await knex('van_assignments').del();
  await knex('plan_pm_drivers').del();
  await knex('plan_pm_sections').del();
  await knex('plan_am_rows').del();
  await knex('plan_am_groups').del();
  await knex('rota_schedule').del();
  await knex('documents').del();
  await knex('applications').del();
  await knex('drivers').del();

  const drivers = [
    { id: uuid(), email: 'amy.jones@opease.co.uk', first_name: 'Amy', last_name: 'Jones', phone: '+447700900111', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN001' },
    { id: uuid(), email: 'ben.carter@opease.co.uk', first_name: 'Ben', last_name: 'Carter', phone: '+447700900112', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN002' },
    { id: uuid(), email: 'cara.smith@opease.co.uk', first_name: 'Cara', last_name: 'Smith', phone: '+447700900113', status: 'Active', depot: 'Greenwich', amazon_id: 'AMZN003' },
    { id: uuid(), email: 'dan.okafor@opease.co.uk', first_name: 'Dan', last_name: 'Okafor', phone: '+447700900114', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN004' },
    { id: uuid(), email: 'elena.rivera@opease.co.uk', first_name: 'Elena', last_name: 'Rivera', phone: '+447700900115', status: 'Active', depot: 'Battersea', amazon_id: 'AMZN005' },
    { id: uuid(), email: 'faisal.khan@opease.co.uk', first_name: 'Faisal', last_name: 'Khan', phone: '+447700900116', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN006' },
    { id: uuid(), email: 'grace.obi@opease.co.uk', first_name: 'Grace', last_name: 'Obi', phone: '+447700900117', status: 'Active', depot: 'Battersea', amazon_id: 'AMZN007' },
    { id: uuid(), email: 'harry.nguyen@opease.co.uk', first_name: 'Harry', last_name: 'Nguyen', phone: '+447700900118', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN008' },
    { id: uuid(), email: 'isla.brown@opease.co.uk', first_name: 'Isla', last_name: 'Brown', phone: '+447700900119', status: 'Active', depot: 'Greenwich', amazon_id: 'AMZN009' },
    { id: uuid(), email: 'james.patel@opease.co.uk', first_name: 'James', last_name: 'Patel', phone: '+447700900120', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN010' },
    { id: uuid(), email: 'kira.mbeki@opease.co.uk', first_name: 'Kira', last_name: 'Mbeki', phone: '+447700900121', status: 'Active', depot: 'Heathrow', amazon_id: 'AMZN011' },
    { id: uuid(), email: 'liam.obrien@opease.co.uk', first_name: 'Liam', last_name: "O'Brien", phone: '+447700900122', status: 'Active', depot: 'Greenwich', amazon_id: 'AMZN012' },
    { id: uuid(), email: 'mia.zhang@opease.co.uk', first_name: 'Mia', last_name: 'Zhang', phone: '+447700900123', status: 'Inactive', depot: 'DLU2', amazon_id: 'AMZN013' },
    { id: uuid(), email: 'noah.wilson@opease.co.uk', first_name: 'Noah', last_name: 'Wilson', phone: '+447700900124', status: 'Active', depot: 'Heathrow', amazon_id: 'AMZN014' },
    { id: uuid(), email: 'olivia.fernandez@opease.co.uk', first_name: 'Olivia', last_name: 'Fernandez', phone: '+447700900125', status: 'Active', depot: 'DLU2', amazon_id: 'AMZN015' },
    { id: uuid(), email: 'ben.singh@opease.co.uk', first_name: 'Ben', last_name: 'Singh', phone: '+447700900222', status: 'Onboarding', depot: 'DLU2', amazon_id: null },
    { id: uuid(), email: 'cara.li@opease.co.uk', first_name: 'Cara', last_name: 'Li', phone: '+447700900333', status: 'Inactive', depot: 'Heathrow', amazon_id: null },
    { id: uuid(), email: 'dan.patel@opease.co.uk', first_name: 'Dan', last_name: 'Patel', phone: '+447700900444', status: 'Offboarded', depot: 'DLU2', amazon_id: null },
  ];

  await knex('drivers').insert(drivers);
}
