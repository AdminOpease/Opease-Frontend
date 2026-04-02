import Joi from 'joi';

export const requestAvailabilitySchema = Joi.object({
  weekId: Joi.number().integer().required(),
  depot: Joi.string().max(20).required(),
});

const dayVal = Joi.string().valid('A', 'N').allow(null);

export const submitAvailabilitySchema = Joi.object({
  sun: dayVal,
  mon: dayVal,
  tue: dayVal,
  wed: dayVal,
  thu: dayVal,
  fri: dayVal,
  sat: dayVal,
  notes: Joi.string().max(500).allow('', null),
}).min(1);

export const applyAvailabilitySchema = Joi.object({
  weekId: Joi.number().integer().required(),
  depot: Joi.string().max(20).required(),
});
