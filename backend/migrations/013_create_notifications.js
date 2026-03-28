export function up(knex) {
  return knex.schema.createTable('notifications', (t) => {
    t.string('id', 36).primary();
    t.uuid('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    t.string('type', 20).notNullable();
    t.string('title', 255).notNullable();
    t.text('body');
    t.boolean('is_read').defaultTo(false);
    t.string('action_url', 500);
    t.timestamps(true, true);

    t.index('driver_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('notifications');
}
