/**
 * Express middleware factory for Joi validation
 * @param {object} schema - Joi schema object with optional body, query, params keys
 */
export default function validate(schema) {
  return (req, res, next) => {
    const toValidate = {};
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    for (const [key, value] of Object.entries(toValidate)) {
      const joiSchema = schema[key];
      const { error, value: validated } = joiSchema.validate(value, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details.map((d) => d.message).join(', '),
          details: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        });
      }
      // Express 5: req.query and req.params are getters, so copy values instead
      if (key === 'body') {
        req.body = validated;
      } else {
        Object.keys(req[key]).forEach(k => delete req[key][k]);
        Object.assign(req[key], validated);
      }
    }
    next();
  };
}
