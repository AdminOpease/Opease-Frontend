import Joi from 'joi';

export const submitApplicationSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    phone: Joi.string().max(20).required(),
    station: Joi.string().max(50).allow('', null),
    // Licence
    licenceNumber: Joi.string().max(50).allow('', null),
    licenceExpiry: Joi.date().allow(null),
    licenceCountry: Joi.string().max(100).allow('', null),
    dateTestPassed: Joi.date().allow(null),
    // ID Document
    idDocumentType: Joi.string().max(50).allow('', null),
    idExpiry: Joi.date().allow(null),
    passportCountry: Joi.string().max(100).allow('', null),
    // Right to Work
    rightToWork: Joi.string().max(50).allow('', null),
    shareCode: Joi.string().max(20).allow('', null),
    // National Insurance
    niNumber: Joi.string().max(20).allow('', null),
    // Address
    addressLine1: Joi.string().max(255).allow('', null),
    addressLine2: Joi.string().max(255).allow('', null),
    town: Joi.string().max(100).allow('', null),
    county: Joi.string().max(100).allow('', null),
    postcode: Joi.string().max(20).allow('', null),
  }),
};

export const listApplicationsSchema = {
  query: Joi.object({
    phase: Joi.number().integer().valid(1, 2),
    depot: Joi.string().max(50),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

export const updateApplicationSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    pre_dcc: Joi.string().valid('In Review', 'FIR', 'Complete', 'DMR'),
    account_id: Joi.string().max(100).allow('', null),
    dl_verification: Joi.string().valid('Pending', 'Pass', 'Fail'),
    bgc: Joi.string().valid('—', 'Not Applied', 'Pending', 'Pass', 'Fail'),
    training_date: Joi.date().allow(null),
    training_company: Joi.string().valid('SC', 'DK').allow('', null),
    training_session: Joi.string().max(50).allow('', null),
    contract_signing: Joi.string().max(500).allow('', null),
    dcc_date: Joi.alternatives().try(Joi.date(), Joi.string().valid('—', 'Need to Review', 'Complete')).allow(null, ''),
    safety_training: Joi.string().allow('', null),
    fir_missing_docs: Joi.string().allow('', null),
    driving_test_slots: Joi.string().max(2000).allow('', null),
    driving_test_result: Joi.string().valid('Pass', 'Fail').allow('', null),
    training_slots: Joi.string().max(2000).allow('', null),
    training_message: Joi.string().max(2000).allow('', null),
    training_booked: Joi.string().max(500).allow('', null),
    training_result: Joi.string().valid('Complete', 'Not Complete').allow('', null),
    flex_confirmed: Joi.number().valid(0, 1),
    dl_confirmed: Joi.number().valid(0, 1),
  }).min(1),
};

export const removeApplicationSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    comment: Joi.string().max(500).allow('', null),
  }),
};
