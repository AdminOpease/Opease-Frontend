export function up(knex) {
  return knex.schema.createTable('rota_schedule', (t) => {
    t.string('id', 36).primary();
    t.string('driver_id', 36).references('id').inTable('drivers').onDelete('CASCADE');
    t.integer('week_id').references('id').inTable('rota_weeks');
    t.string('sun', 10).defaultTo('');
    t.string('mon', 10).defaultTo('');
    t.string('tue', 10).defaultTo('');
    t.string('wed', 10).defaultTo('');
    t.string('thu', 10).defaultTo('');
    t.string('fri', 10).defaultTo('');
    t.string('sat', 10).defaultTo('');

    t.unique(['driver_id', 'week_id']);
    t.index(['driver_id', 'week_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('rota_schedule');
}
