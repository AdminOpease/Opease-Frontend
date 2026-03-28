export function up(knex) {
  return knex.schema.createTable('applications', (t) => {
    t.string('id', 36).primary();
    t.uuid('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    t.date('date_applied').defaultTo(knex.fn.now());
    // Phase 1
    t.string('pre_dcc', 20).defaultTo('In Review');
    t.string('account_id', 100);
    t.string('dl_verification', 20).defaultTo('Pending');
    // Phase 2
    t.string('bgc', 20).defaultTo('Pending');
    t.date('training_date');
    t.string('training_company', 10);
    t.string('training_session', 10);
    t.string('contract_signing', 20).defaultTo('Pending');
    t.date('dcc_date');
    // Lifecycle
    t.timestamp('activated_at');
    t.timestamp('removed_at');
    t.text('removed_comment');
    // Timestamps
    t.timestamps(true, true);

    t.index('driver_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('applications');
}
