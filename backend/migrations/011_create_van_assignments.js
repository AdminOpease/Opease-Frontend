export function up(knex) {
  return knex.schema.createTable('van_assignments', (t) => {
    t.string('id', 36).primary();
    t.uuid('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    t.uuid('van_id').references('id').inTable('vans').onDelete('CASCADE');
    t.date('assign_date').notNullable();

    t.unique(['driver_id', 'assign_date']);
    t.index('assign_date');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('van_assignments');
}
