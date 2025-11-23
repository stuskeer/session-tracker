import joi from "joi";

const sessionSchema = joi.object({
  id: joi.string().uuid().required(),
  user_id: joi.string().uuid().required(),
  location: joi.string()
    .trim()
    .min(1)
    .max(200)
    .pattern(/^[a-zA-Z0-9\s\-\,\.\']+$/)
    .required()
    .messages({
      'string.empty': 'Location is required',
      'string.min': 'Location must not be empty',
      'string.max': 'Location must not exceed 200 characters',
      'string.pattern.base': 'Location can only contain letters, numbers, spaces, hyphens, commas, periods, and apostrophes'
    }),
  date: joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Date is required'
    }),
  kite: joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\.]+$/)
    .required()
    .messages({
      'string.empty': 'Kite is required',
      'string.min': 'Kite must not be empty',
      'string.max': 'Kite must not exceed 100 characters',
      'string.pattern.base': 'Kite name can only contain letters, numbers, spaces, hyphens, and periods'
    }),
  duration: joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Duration must be in HH:MM format'
    }),
  max_jump: joi.number()
    .min(0)
    .max(100)
    .precision(1)
    .required()
    .messages({
      'number.min': 'Max jump must be a positive number',
      'number.max': 'Max jump must not exceed 100 meters',
      'number.base': 'Max jump must be a number'
    }),
});

const updateSessionSchema = joi.object({
  id: joi.string().uuid().required(),
  user_id: joi.string().uuid().optional(),
  location: joi.string()
    .trim()
    .min(1)
    .max(200)
    .pattern(/^[a-zA-Z0-9\s\-\,\.\']+$/)
    .optional()
    .messages({
      'string.min': 'Location must not be empty',
      'string.max': 'Location must not exceed 200 characters',
      'string.pattern.base': 'Location can only contain letters, numbers, spaces, hyphens, commas, periods, and apostrophes'
    }),
  date: joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format'
    }),
  kite: joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\.]+$/)
    .optional()
    .messages({
      'string.min': 'Kite must not be empty',
      'string.max': 'Kite must not exceed 100 characters',
      'string.pattern.base': 'Kite name can only contain letters, numbers, spaces, hyphens, and periods'
    }),
  duration: joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Duration must be in HH:MM format'
    }),
  max_jump: joi.number()
    .min(0)
    .max(100)
    .precision(1)
    .optional()
    .messages({
      'number.min': 'Max jump must be a positive number',
      'number.max': 'Max jump must not exceed 100 meters',
      'number.base': 'Max jump must be a number'
    }),
}).min(2); // At least id + one other field

export default sessionSchema;
export { updateSessionSchema };