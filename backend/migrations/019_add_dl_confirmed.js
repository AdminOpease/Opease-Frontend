export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.boolean('dl_confirmed').notNullable().defaultTo(false);
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('dl_confirmed');
  });
}
