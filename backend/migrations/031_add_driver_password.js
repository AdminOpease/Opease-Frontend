export function up(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.string('password_hash', 255).defaultTo(null);
    t.boolean('portal_invited').defaultTo(false);
  });
}

export function down(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.dropColumn('password_hash');
    t.dropColumn('portal_invited');
  });
}
