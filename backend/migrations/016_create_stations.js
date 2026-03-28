export function up(knex) {
  return knex.schema.createTable('stations', (t) => {
    t.string('id', 36).primary();
    t.string('code', 20).unique().notNullable();
    t.string('name', 100).notNullable();
    t.string('region', 100);
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('stations');
}
