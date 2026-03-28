import Joi from 'joi';

export const listDriversSchema = {
  query: Joi.object({
    depot: Joi.string().max(50),
    status: Joi.string().valid('Active', 'Onboarding', 'Inactive', 'Offboarded'),
    search: Joi.string().max(100),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

export const updateDriverSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    first_name: Joi.string().max(100),
    last_name: Joi.string().max(100),
    phone: Joi.string().max(20),
    depot: Joi.string().max(50),
    amazon_id: Joi.string().max(50).allow('', null),
    licence_number: Joi.string().max(50).allow('', null),
    licence_expiry: Joi.date().allow(null),
    licence_country: Joi.string().max(100).allow('', null),
    date_test_passed: Joi.date().allow(null),
    id_document_type: Joi.string().max(50).allow('', null),
    id_expiry: Joi.date().allow(null),
    passport_country: Joi.string().max(100).allow('', null),
    right_to_work: Joi.string().max(50).allow('', null),
    share_code: Joi.string().max(20).allow('', null),
    ni_number: Joi.string().max(20).allow('', null),
    address_line1: Joi.string().max(255).allow('', null),
    address_line2: Joi.string().max(255).allow('', null),
    town: Joi.string().max(100).allow('', null),
    county: Joi.string().max(100).allow('', null),
    postcode: Joi.string().max(20).allow('', null),
    emergency_name: Joi.string().max(100).allow('', null),
    emergency_relationship: Joi.string().max(50).allow('', null),
    emergency_phone: Joi.string().max(20).allow('', null),
    emergency_email: Joi.string().email().allow('', null),
    bank_name: Joi.string().max(100).allow('', null),
    sort_code: Joi.string().max(10).allow('', null),
    account_number: Joi.string().max(20).allow('', null),
    tax_reference: Joi.string().max(20).allow('', null),
    vat_number: Joi.string().max(20).allow('', null),
    online_training_date: Joi.date().allow(null),
    safety_training_date: Joi.date().allow(null),
  }).min(1),
};

export const updateStatusSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('Active', 'Onboarding', 'Inactive', 'Offboarded').required(),
  }),
};
