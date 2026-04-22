export function up(knex) {
  return knex.schema.createTable('contracts', (t) => {
    t.string('id', 36).primary();
    t.string('driver_id', 36).references('id').inTable('drivers').onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.string('status', 20).defaultTo('pending'); // pending|viewed|completed|declined|expired
    t.string('signing_provider', 50); // docusign|adobe
    t.string('external_id', 255);
    t.timestamp('sent_at');
    t.timestamp('viewed_at');
    t.timestamp('completed_at');
    t.timestamps(true, true);

    t.index('driver_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('contracts');
}
