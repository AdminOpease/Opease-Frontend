export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.text('training_slots').nullable();
    t.text('training_message').nullable();
    t.text('training_booked').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('training_slots');
    t.dropColumn('training_message');
    t.dropColumn('training_booked');
  });
}
