export function up(knex) {
  return knex.schema.createTable('rota_availability', (t) => {
    t.string('id', 36).primary();
    t.string('driver_id', 36).notNullable().references('id').inTable('drivers').onDelete('CASCADE');
    t.integer('week_id').notNullable().references('id').inTable('rota_weeks');
    t.string('depot', 20).notNullable();
    t.string('sun', 10).nullable();
    t.string('mon', 10).nullable();
    t.string('tue', 10).nullable();
    t.string('wed', 10).nullable();
    t.string('thu', 10).nullable();
    t.string('fri', 10).nullable();
    t.string('sat', 10).nullable();
    t.text('notes').nullable();
    t.string('status', 20).notNullable().defaultTo('pending');
    t.timestamp('requested_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('submitted_at').nullable();
    t.unique(['driver_id', 'week_id']);
    t.index(['week_id', 'depot']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('rota_availability');
}
