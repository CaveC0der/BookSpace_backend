import * as Joi from 'joi';

export const ConfigValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .optional()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),

  PORT: Joi.number().optional().default(5000),

  DB_DIALECT: Joi.string(),
  DB_HOST: Joi.string(),
  DB_PORT: Joi.number(),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string(),
  DB_NAME: Joi.string(),

  COOKIE_NAME: Joi.string(),
  COOKIE_MAX_AGE: Joi.number(),

  SALT_LENGTH: Joi.number(),

  JWT_ALGORITHM: Joi.string(),
  JWT_ACCESS_SECRET: Joi.string(),
  JWT_ACCESS_EXPIRES_IN: Joi.string(),
  JWT_REFRESH_SECRET: Joi.string(),
  JWT_REFRESH_EXPIRES_IN: Joi.string(),

  SERVE_STATIC_FOLDER: Joi.string(),
  SERVE_STATIC_PREFIX: Joi.string(),

  THROTTLER_TTL: Joi.number(),
  THROTTLER_LIMIT: Joi.number(),
}).options({ presence: 'required' });
