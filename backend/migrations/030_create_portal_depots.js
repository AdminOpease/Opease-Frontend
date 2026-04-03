export function up(knex) {
  return knex.schema.createTable('portal_user_depots', (t) => {
    t.string('id', 36).primary();
    t.string('user_id', 36).references('id').inTable('portal_users').onDelete('CASCADE');
    t.string('depot_code', 50).notNullable();
    t.unique(['user_id', 'depot_code']);
    t.index('user_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('portal_user_depots');
}
