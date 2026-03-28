export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.string('driving_test_result', 20).nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('driving_test_result');
  });
}
