export function up(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.string('transporter_id', 100).nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.dropColumn('transporter_id');
  });
}
