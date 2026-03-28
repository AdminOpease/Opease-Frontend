export function up(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.boolean('flex_confirmed').notNullable().defaultTo(false);
  });
}

export function down(knex) {
  return knex.schema.alterTable('applications', (t) => {
    t.dropColumn('flex_confirmed');
  });
}
