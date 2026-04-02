export function up(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.text('last_dvla_check').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.dropColumn('last_dvla_check');
  });
}
