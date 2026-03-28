export function up(knex) {
  return knex.schema.createTable('drivers', (t) => {
    t.string('id', 36).primary();
    t.string('email', 255).unique().notNullable();
    t.string('cognito_sub', 255).unique();
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.string('phone', 20);
    t.string('status', 20).defaultTo('Onboarding');
    t.string('depot', 50);
    t.string('amazon_id', 50);
    // Licence
    t.string('licence_number', 50);
    t.date('licence_expiry');
    t.string('licence_country', 100);
    t.date('date_test_passed');
    // ID Document
    t.string('id_document_type', 50);
    t.date('id_expiry');
    t.string('passport_country', 100);
    // Right to Work
    t.string('right_to_work', 50);
    t.string('share_code', 20);
    // National Insurance
    t.string('ni_number', 20);
    // Address
    t.string('address_line1', 255);
    t.string('address_line2', 255);
    t.string('town', 100);
    t.string('county', 100);
    t.string('postcode', 20);
    // Emergency Contact
    t.string('emergency_name', 100);
    t.string('emergency_relationship', 50);
    t.string('emergency_phone', 20);
    t.string('emergency_email', 255);
    // Banking
    t.string('bank_name', 100);
    t.string('sort_code', 10);
    t.string('account_number', 20);
    t.string('tax_reference', 20);
    t.string('vat_number', 20);
    // Training
    t.date('online_training_date');
    t.date('safety_training_date');
    // Timestamps
    t.timestamps(true, true);

    t.index('depot');
    t.index('status');
    t.index('amazon_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('drivers');
}
