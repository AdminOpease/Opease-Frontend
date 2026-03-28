export function up(knex) {
  return knex.schema.createTable('vans', (t) => {
    t.string('id', 36).primary();
    t.string('registration', 20).unique().notNullable();
    t.string('make', 50);
    t.string('station', 50);
    t.string('transmission', 10);
    t.timestamps(true, true);

    t.index('station');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('vans');
}
