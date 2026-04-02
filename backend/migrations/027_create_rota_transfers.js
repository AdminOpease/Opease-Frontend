export function up(knex) {
  return knex.schema.createTable('rota_transfers', (t) => {
    t.string('id', 36).primary();
    t.string('schedule_id', 36).references('id').inTable('rota_schedule').onDelete('CASCADE');
    t.string('day_col', 3).notNullable(); // 'sun','mon','tue','wed','thu','fri','sat'
    t.string('from_depot', 50).notNullable();
    t.string('to_depot', 50).notNullable();
    t.string('assigned_code', 10).defaultTo('');

    t.unique(['schedule_id', 'day_col']);
    t.index(['to_depot']);
    t.index(['from_depot']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('rota_transfers');
}
