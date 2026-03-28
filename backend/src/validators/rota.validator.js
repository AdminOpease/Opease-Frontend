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
  }).min(1),
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
      })
    ).min(1).required(),
  }),
};
