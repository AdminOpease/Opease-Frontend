export function up(knex) {
  return knex.schema.createTable('change_requests', (t) => {
    t.string('id', 36).primary();
    t.uuid('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    t.string('section', 50).notNullable();
    t.string('field_name', 50).notNullable();
    t.text('old_value');
    t.text('new_value');
    t.string('status', 20).defaultTo('Pending');
    t.uuid('reviewed_by');
    t.timestamp('reviewed_at');
    t.timestamps(true, true);

    t.index('driver_id');
    t.index('status');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('change_requests');
}
