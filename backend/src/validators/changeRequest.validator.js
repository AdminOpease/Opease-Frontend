import Joi from 'joi';

export const createChangeRequestSchema = {
  body: Joi.object({
    driver_id: Joi.string().uuid().required(),
    section: Joi.string().valid('account', 'emergency', 'payment').required(),
    field_name: Joi.string().max(50).required(),
    old_value: Joi.string().max(500).allow('', null),
    new_value: Joi.string().max(500).required(),
  }),
};

export const listChangeRequestsSchema = {
  query: Joi.object({
    status: Joi.string().valid('Pending', 'Approved', 'Rejected'),
    driverId: Joi.string().uuid(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

export const reviewChangeRequestSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('Approved', 'Rejected').required(),
  }),
};
