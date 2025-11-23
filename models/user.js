import joi from "joi";

// Email validation schema
const emailSchema = joi.string()
  .email({ tlds: { allow: false } }) // Allow all TLDs
  .max(255)
  .trim()
  .lowercase()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'string.max': 'Email must not exceed 255 characters'
  });

// Password validation schema
const passwordSchema = joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.empty': 'Password is required'
  });

// Login validation schema
const loginSchema = joi.object({
  email: emailSchema,
  password: joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

// Registration validation schema
const registerSchema = joi.object({
  email: emailSchema,
  password: passwordSchema
});

// Email update validation schema
const updateEmailSchema = joi.object({
  email: emailSchema
});

// Kite name validation schema
const kiteSchema = joi.object({
  kite: joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\.]+$/)
    .required()
    .messages({
      'string.empty': 'Kite name is required',
      'string.min': 'Kite name must not be empty',
      'string.max': 'Kite name must not exceed 100 characters',
      'string.pattern.base': 'Kite name can only contain letters, numbers, spaces, hyphens, and periods'
    })
});

export { loginSchema, registerSchema, updateEmailSchema, kiteSchema };
