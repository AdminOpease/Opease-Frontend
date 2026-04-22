export function up(knex) {
  return knex.schema.createTable('documents', (t) => {
    t.string('id', 36).primary();
    t.string('driver_id', 36).references('id').inTable('drivers').onDelete('CASCADE');
    t.string('title', 255);
    t.string('type', 50).notNullable();
    t.string('s3_key', 500).notNullable();
    t.string('file_name', 255);
    t.integer('file_size');
    t.string('mime_type', 100);
    t.date('expiry_date');
    t.timestamp('uploaded_at').defaultTo(knex.fn.now());
    t.timestamp('archived_at');
    t.timestamp('deleted_at');
    t.timestamps(true, true);

    t.index('driver_id');
    t.index('expiry_date');
    t.index('type');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('documents');
}
