export function up(knex) {
  return knex.schema.createTable('rota_weeks', (t) => {
    t.increments('id').primary();
    t.integer('week_number').notNullable().unique();
    t.date('start_date').notNullable();
    t.date('end_date').notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('rota_weeks');
}
