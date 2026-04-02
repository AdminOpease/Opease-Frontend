export function up(knex) {
  return knex.schema.alterTable('rota_schedule', (t) => {
    t.string('support', 10).defaultTo('');
    t.string('other', 10).defaultTo('');
    t.text('notes').defaultTo('');
  });
}

export function down(knex) {
  return knex.schema.alterTable('rota_schedule', (t) => {
    t.dropColumn('support');
    t.dropColumn('other');
    t.dropColumn('notes');
  });
}
