import Joi from 'joi';

export const listWorkingHoursSchema = {
  query: Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    depot: Joi.string().max(50),
    driverId: Joi.string().uuid(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

export const createWorkingHoursSchema = {
  body: Joi.object({
    driver_id: Joi.string().uuid(),
    work_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    depot: Joi.string().max(50),
    vehicle: Joi.string().max(20).allow('', null),
    route_number: Joi.string().max(20).allow('', null),
    start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow('', null),
    finish_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow('', null),
    breaks: Joi.string().max(10).allow('', null),
    stops: Joi.number().integer().allow(null),
    comments: Joi.string().max(500).allow('', null),
  }),
};

export const updateWorkingHoursSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    driver_id: Joi.string().uuid(),
    vehicle: Joi.string().max(20).allow('', null),
    route_number: Joi.string().max(20).allow('', null),
    start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow('', null),
    finish_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow('', null),
    breaks: Joi.string().max(10).allow('', null),
    stops: Joi.number().integer().allow(null),
    comments: Joi.string().max(500).allow('', null),
  }).min(1),
};

export const importWorkingHoursSchema = {
  body: Joi.object({
    work_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    depot: Joi.string().max(50).required(),
    rows: Joi.array().items(
      Joi.object({
        driver_name: Joi.string().allow('', null),
        driver_id: Joi.string().uuid().allow(null),
        vehicle: Joi.string().allow('', null),
        route_number: Joi.string().allow('', null),
        start_time: Joi.string().allow('', null),
        finish_time: Joi.string().allow('', null),
        breaks: Joi.string().allow('', null),
        stops: Joi.number().integer().allow(null),
        comments: Joi.string().allow('', null),
      })
    ).min(1).required(),
  }),
};
