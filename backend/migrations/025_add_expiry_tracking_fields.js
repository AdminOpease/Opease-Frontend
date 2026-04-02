export function up(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.date('visa_expiry').nullable();
    t.string('dvla_check_code', 20).nullable();
    t.datetime('dvla_code_submitted_at').nullable();
    t.string('rtw_share_code_new', 20).nullable();
    t.datetime('rtw_code_submitted_at').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('drivers', (t) => {
    t.dropColumn('visa_expiry');
    t.dropColumn('dvla_check_code');
    t.dropColumn('dvla_code_submitted_at');
    t.dropColumn('rtw_share_code_new');
    t.dropColumn('rtw_code_submitted_at');
  });
}
