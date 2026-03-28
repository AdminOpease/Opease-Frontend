export function up(knex) {
  return knex.schema.createTable('working_hours', (t) => {
    t.string('id', 36).primary();
    t.uuid('driver_id').references('id').inTable('drivers');
    t.date('work_date').notNullable();
    t.string('depot', 50);
    t.string('vehicle', 20);
    t.string('route_number', 20);
    t.time('start_time');
    t.time('finish_time');
    t.string('breaks', 10);
    t.integer('stops');
    t.text('comments');
    t.timestamps(true, true);

    t.index(['work_date', 'depot']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('working_hours');
}
