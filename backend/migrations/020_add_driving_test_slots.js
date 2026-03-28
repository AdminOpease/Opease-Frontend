export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.text('driving_test_slots').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('driving_test_slots');
  });
}
