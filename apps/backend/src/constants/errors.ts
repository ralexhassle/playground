/**
 * HTTP Error Messages and Codes
 * Centralized error handling constants
 */

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_USER_DATA: 'INVALID_USER_DATA',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  TOKEN_EXPIRED: 'Token has expired',

  // Users
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
  INVALID_USER_DATA: 'Invalid user data provided',

  // Database
  DATABASE_ERROR: 'Database operation failed',
  CONNECTION_ERROR: 'Database connection failed',

  // Validation
  VALIDATION_ERROR: 'Invalid request data',
  MISSING_FIELDS: 'Required fields are missing',
  INVALID_FORMAT: 'Invalid data format',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // Generic
  RESOURCE_NOT_FOUND: 'Resource not found',
  OPERATION_FAILED: 'Operation failed',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
export type ErrorMessage = keyof typeof ERROR_MESSAGES;
