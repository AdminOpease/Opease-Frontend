export function up(knex) {
  return knex.schema.createTable('plan_pm_sections', (t) => {
    t.string('id', 36).primary();
    t.date('plan_date').notNullable();
    t.string('depot', 50).notNullable();
    t.string('title', 100).notNullable();
    t.string('time', 10);
    t.integer('sort_order').defaultTo(0);
    t.string('linked_shift_code', 10);

    t.unique(['plan_date', 'depot', 'sort_order']);
    t.index(['plan_date', 'depot']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('plan_pm_sections');
}
