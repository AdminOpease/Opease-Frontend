import Joi from 'joi';

// AM Plan
export const listAmPlanSchema = {
  query: Joi.object({
    date: Joi.date().required(),
    depot: Joi.string().max(50).required(),
  }),
};

export const createAmGroupSchema = {
  body: Joi.object({
    plan_date: Joi.date().required(),
    depot: Joi.string().max(50).required(),
    title: Joi.string().max(100).required(),
    time: Joi.string().max(10).allow('', null),
    color: Joi.string().max(10).allow('', null),
    bg_color: Joi.string().max(10).allow('', null),
    sort_order: Joi.number().integer(),
    linked_shift_code: Joi.string().max(10).allow('', null),
  }),
};

export const updateAmGroupSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(100),
    time: Joi.string().max(10).allow('', null),
    color: Joi.string().max(10).allow('', null),
    bg_color: Joi.string().max(10).allow('', null),
    sort_order: Joi.number().integer(),
    linked_shift_code: Joi.string().max(10).allow('', null),
  }).min(1),
};

export const createAmRowSchema = {
  body: Joi.object({
    group_id: Joi.string().uuid().required(),
    driver_id: Joi.string().uuid().allow(null),
    van: Joi.string().max(20).allow('', null),
    route: Joi.string().max(20).allow('', null),
    bay: Joi.string().max(20).allow('', null),
    atlas: Joi.string().max(50).allow('', null),
    sort_order: Joi.number().integer(),
  }),
};

export const updateAmRowSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    driver_id: Joi.string().uuid().allow(null),
    van: Joi.string().max(20).allow('', null),
    route: Joi.string().max(20).allow('', null),
    bay: Joi.string().max(20).allow('', null),
    atlas: Joi.string().max(50).allow('', null),
    sort_order: Joi.number().integer(),
  }).min(1),
};

export const importAmPlanSchema = {
  body: Joi.object({
    plan_date: Joi.date().required(),
    depot: Joi.string().max(50).required(),
    rows: Joi.array().items(
      Joi.object({
        transporter_id: Joi.string().required(),
        van: Joi.string().allow('', null),
        route: Joi.string().allow('', null),
        bay: Joi.string().allow('', null),
        atlas: Joi.string().allow('', null),
      })
    ).min(1).required(),
  }),
};

// PM Plan
export const listPmPlanSchema = {
  query: Joi.object({
    date: Joi.date().required(),
    depot: Joi.string().max(50).required(),
  }),
};

export const createPmSectionSchema = {
  body: Joi.object({
    plan_date: Joi.date().required(),
    depot: Joi.string().max(50).required(),
    title: Joi.string().max(100).required(),
    time: Joi.string().max(10).allow('', null),
    sort_order: Joi.number().integer(),
    linked_shift_code: Joi.string().max(10).allow('', null),
  }),
};

export const updatePmSectionSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(100),
    time: Joi.string().max(10).allow('', null),
    sort_order: Joi.number().integer(),
    linked_shift_code: Joi.string().max(10).allow('', null),
  }).min(1),
};

export const addPmDriverSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    driver_id: Joi.string().uuid().required(),
    sort_order: Joi.number().integer(),
  }),
};
