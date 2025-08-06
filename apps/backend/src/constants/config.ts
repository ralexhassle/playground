/**
 * Application Configuration Constants
 * Environment-specific and application-wide constants
 */

export const APP_CONFIG = {
  NAME: 'Fullstack Monorepo API',
  VERSION: '1.0.0',
  DESCRIPTION:
    'A modern fullstack monorepo with React frontend and Fastify backend',
  DEFAULT_PORT: 3000,
  DEFAULT_HOST: '0.0.0.0',
} as const;

export const JWT_CONFIG = {
  DEFAULT_SECRET: 'development-jwt-secret-change-in-production',
  DEFAULT_EXPIRY: '24h',
  ALGORITHM: 'HS256' as const,
} as const;

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 12,
  PBKDF2_ITERATIONS: 10000,
  PBKDF2_KEY_LENGTH: 64,
  PBKDF2_DIGEST: 'sha512' as const,
} as const;

export const DATABASE_CONFIG = {
  DEFAULT_CONNECTION_TIMEOUT: 5000,
  DEFAULT_QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 20,
  IDLE_TIMEOUT: 30000,
} as const;

export const CORS_CONFIG = {
  DEVELOPMENT_ORIGINS: [
    'http://localhost:4200',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  PRODUCTION_ORIGINS: [], // To be configured based on deployment
} as const;

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
