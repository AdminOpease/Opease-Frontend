export function up(knex) {
  return knex.schema.createTable('plan_am_rows', (t) => {
    t.string('id', 36).primary();
    t.uuid('group_id').references('id').inTable('plan_am_groups').onDelete('CASCADE');
    t.uuid('driver_id').references('id').inTable('drivers');
    t.string('van', 20);
    t.string('route', 20);
    t.string('bay', 20);
    t.string('atlas', 50);
    t.integer('sort_order').defaultTo(0);

    t.index('group_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('plan_am_rows');
}
