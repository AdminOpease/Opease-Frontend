import Joi from 'joi';

const shiftCode = Joi.string().max(10).allow('');

export const listScheduleSchema = {
  query: Joi.object({
    weekId: Joi.number().integer(),
    depot: Joi.string().max(50),
  }),
};

export const updateShiftSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    sun: shiftCode,
    mon: shiftCode,
    tue: shiftCode,
    wed: shiftCode,
    thu: shiftCode,
    fri: shiftCode,
    sat: shiftCode,
    support: shiftCode,
    other: shiftCode,
    notes: Joi.string().max(500).allow('', null),
  }).min(1),
};

export const createTransferSchema = {
  body: Joi.object({
    schedule_id: Joi.string().uuid().required(),
    day_col: Joi.string().valid('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat').required(),
    from_depot: Joi.string().max(50).required(),
    to_depot: Joi.string().max(50).required(),
  }),
};

export const updateTransferSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    assigned_code: Joi.string().max(10).allow(''),
  }).min(1),
};

export const listTransfersSchema = {
  query: Joi.object({
    weekId: Joi.number().integer().required(),
    depot: Joi.string().max(50).required(),
    direction: Joi.string().valid('incoming', 'outgoing').default('incoming'),
  }),
};

export const deleteTransferSchema = {
  body: Joi.object({
    schedule_id: Joi.string().uuid().required(),
    day_col: Joi.string().valid('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat').required(),
  }),
};

export const bulkScheduleSchema = {
  body: Joi.object({
    schedules: Joi.array().items(
      Joi.object({
        driver_id: Joi.string().uuid().required(),
        week_id: Joi.number().integer().required(),
        sun: shiftCode,
        mon: shiftCode,
        tue: shiftCode,
        wed: shiftCode,
        thu: shiftCode,
        fri: shiftCode,
        sat: shiftCode,
        support: shiftCode,
        other: shiftCode,
        notes: Joi.string().max(500).allow('', null),
      })
    ).min(1).required(),
  }),
};
