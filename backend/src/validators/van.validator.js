import Joi from 'joi';

export const listVansSchema = {
  query: Joi.object({
    station: Joi.string().max(50),
    make: Joi.string().max(50),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(200),
  }),
};

export const createVanSchema = {
  body: Joi.object({
    registration: Joi.string().max(20).required(),
    make: Joi.string().max(50),
    station: Joi.string().max(50),
    transmission: Joi.string().valid('Manual', 'Auto'),
  }),
};

export const updateVanSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    registration: Joi.string().max(20),
    make: Joi.string().max(50),
    station: Joi.string().max(50),
    transmission: Joi.string().valid('Manual', 'Auto'),
  }).min(1),
};

export const listAssignmentsSchema = {
  query: Joi.object({
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    depot: Joi.string().max(50),
    driverId: Joi.string().uuid(),
  }),
};

export const createAssignmentSchema = {
  body: Joi.object({
    driver_id: Joi.string().uuid().required(),
    van_id: Joi.string().uuid().required(),
    assign_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  }),
};
