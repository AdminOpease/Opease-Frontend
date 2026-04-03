export function up(knex) {
  return knex.schema.createTable('portal_users', (t) => {
    t.string('id', 36).primary();
    t.string('email', 100).unique().notNullable();
    t.string('password_hash', 255).notNullable();
    t.string('first_name', 50).notNullable();
    t.string('last_name', 50).notNullable();
    t.boolean('is_super_admin').defaultTo(false);
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('portal_users');
}
