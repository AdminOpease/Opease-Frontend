import Joi from 'joi';

export const listDocumentsSchema = {
  query: Joi.object({
    driverId: Joi.string().uuid(),
    type: Joi.string().max(50),
    expiring: Joi.boolean(),
    includeDeleted: Joi.boolean(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

export const createDocumentSchema = {
  body: Joi.object({
    driver_id: Joi.string().uuid().required(),
    title: Joi.string().max(255),
    type: Joi.string().max(50).required(),
    s3_key: Joi.string().max(500).required(),
    file_name: Joi.string().max(255),
    file_size: Joi.number().integer(),
    mime_type: Joi.string().max(100),
    expiry_date: Joi.date().allow(null),
  }),
};

export const updateDocumentSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(255),
    type: Joi.string().max(50),
    expiry_date: Joi.date().allow(null),
  }).min(1),
};

export const presignedUrlSchema = {
  body: Joi.object({
    fileName: Joi.string().max(255).required(),
    contentType: Joi.string().max(100).required(),
    category: Joi.string().max(50).required(),
    driverId: Joi.string().uuid().required(),
  }),
};
