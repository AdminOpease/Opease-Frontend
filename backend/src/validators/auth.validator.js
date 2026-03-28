import Joi from 'joi';

export const signupSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    phone: Joi.string().pattern(/^\+?\d{10,15}$/).required(),
    station: Joi.string().max(50).allow('', null),
  }),
};

export const verifyEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().min(4).max(10).required(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
