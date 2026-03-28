import Joi from 'joi';

export const createNotificationSchema = {
  body: Joi.object({
    driver_id: Joi.string().uuid().required(),
    type: Joi.string().valid('action', 'communication').required(),
    title: Joi.string().max(255).required(),
    body: Joi.string().max(1000).allow('', null),
    action_url: Joi.string().max(500).allow('', null),
  }),
};

export const listNotificationsSchema = {
  query: Joi.object({
    driverId: Joi.string().uuid(),
    unreadOnly: Joi.boolean(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};
