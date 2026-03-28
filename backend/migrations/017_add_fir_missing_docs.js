export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.text('fir_missing_docs').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('fir_missing_docs');
  });
}
