export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.string('training_result', 20).nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('training_result');
  });
}
