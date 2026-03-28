export function up(knex) {
  return knex.schema.createTable('plan_pm_drivers', (t) => {
    t.string('id', 36).primary();
    t.uuid('section_id').references('id').inTable('plan_pm_sections').onDelete('CASCADE');
    t.uuid('driver_id').references('id').inTable('drivers');
    t.integer('sort_order').defaultTo(0);

    t.index('section_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('plan_pm_drivers');
}
