import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('plan_pm_drivers').del();
  await knex('plan_pm_sections').del();
  await knex('plan_am_rows').del();
  await knex('plan_am_groups').del();

  const today = new Date().toISOString().slice(0, 10);

  const depots = ['DLU2', 'Heathrow', 'Greenwich', 'Battersea'];
  const driversByDepot = {};
  for (const depot of depots) {
    driversByDepot[depot] = await knex('drivers').where({ depot }).whereNotNull('amazon_id').orderBy('last_name');
  }

  const amGroupDefs = [
    { title: 'Same Day Routes', time: '06:10', color: '#2E7D32', bg_color: '#E8F5E9', sort_order: 0 },
    { title: 'SWA', time: '10:05', color: '#F9A825', bg_color: '#FFFDE7', sort_order: 1 },
    { title: 'Electric Vehicle', time: '11:15', color: '#0288D1', bg_color: '#E1F5FE', sort_order: 2 },
    { title: 'Full Routes', time: '11:30', color: '#424242', bg_color: '#FAFAFA', sort_order: 3 },
    { title: 'Cycle 2 Route', time: '12:00', color: '#6A1B9A', bg_color: '#F3E5F5', sort_order: 4 },
  ];

  for (const depot of depots) {
    const drivers = driversByDepot[depot];

    for (const gd of amGroupDefs) {
      const groupId = uuid();
      await knex('plan_am_groups').insert({ id: groupId, plan_date: today, depot, ...gd });

      const driverSlice = drivers.slice(0, 2);
      for (let i = 0; i < driverSlice.length; i++) {
        await knex('plan_am_rows').insert({
          id: uuid(),
          group_id: groupId,
          driver_id: driverSlice[i].id,
          van: '',
          route: '',
          bay: '',
          atlas: '',
          sort_order: i,
        });
      }
    }

    const pmSections = [
      { title: 'Same Day Returns', time: '14:00' },
      { title: 'SWA Returns', time: '16:00' },
      { title: 'Full Route Returns', time: '18:00' },
    ];

    for (let i = 0; i < pmSections.length; i++) {
      const sectionId = uuid();
      await knex('plan_pm_sections').insert({
        id: sectionId,
        plan_date: today,
        depot,
        title: pmSections[i].title,
        time: pmSections[i].time,
        sort_order: i,
      });

      const driverSlice = drivers.slice(0, 2);
      for (let j = 0; j < driverSlice.length; j++) {
        await knex('plan_pm_drivers').insert({
          id: uuid(),
          section_id: sectionId,
          driver_id: driverSlice[j].id,
          sort_order: j,
        });
      }
    }
  }
}
