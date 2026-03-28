import { AppError } from '../utils/errors.js';

export default function errorHandler(err, req, res, _next) {
  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.details.map((d) => d.message).join(', '),
    });
  }

  // Our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Knex / PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: err.detail || 'A record with this value already exists',
    });
  }
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Foreign key violation',
      message: err.detail || 'Referenced record does not exist',
    });
  }

  // AWS Cognito errors
  if (err.name === 'UserNotFoundException') {
    return res.status(404).json({ error: 'User not found' });
  }
  if (err.name === 'UsernameExistsException') {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  if (err.name === 'NotAuthorizedException') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (err.name === 'CodeMismatchException') {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  if (err.name === 'ExpiredCodeException') {
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
