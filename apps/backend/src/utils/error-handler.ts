import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import type { ApiError } from '@/types';
import {
  ERROR_MESSAGES,
  ERROR_CODES,
  HTTP_STATUS,
  ENVIRONMENTS,
} from '../constants';

/**
 * Global error handler for Fastify
 */
export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      // Log error for debugging
      request.log.error(error);

      // Determine status code
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

      // Create standardized error response
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: error.code || ERROR_CODES.INTERNAL_ERROR,
          message: getPublicErrorMessage(error, statusCode),
          details:
            process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT
              ? error.stack
              : undefined,
        },
        timestamp: new Date().toISOString(),
      };

      return reply.status(statusCode).send(errorResponse);
    }
  );
}

/**
 * Convert internal errors to appropriate public messages
 */
function getPublicErrorMessage(
  error: FastifyError,
  statusCode: number
): string {
  // Validation errors
  if (error.code === 'FST_ERR_VALIDATION') {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  // Authentication errors
  if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (statusCode === HTTP_STATUS.FORBIDDEN) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  // Not found errors
  if (statusCode === HTTP_STATUS.NOT_FOUND) {
    return ERROR_MESSAGES.RESOURCE_NOT_FOUND;
  }

  // Database errors (Drizzle)
  if (error.message?.includes('Failed query')) {
    return ERROR_MESSAGES.DATABASE_ERROR;
  }

  // Conflict errors (duplicate email, etc.)
  if (statusCode === HTTP_STATUS.CONFLICT) {
    return ERROR_MESSAGES.USER_ALREADY_EXISTS;
  }

  // For 500 errors, mask details in production
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT
      ? error.message
      : ERROR_MESSAGES.INTERNAL_ERROR;
  }

  return error.message || ERROR_MESSAGES.OPERATION_FAILED;
}

/**
 * Create HTTP error with status code
 */
export function createHttpError(
  statusCode: number,
  message: string,
  code?: string
) {
  const error = new Error(message) as FastifyError;
  error.statusCode = statusCode;
  error.code = code || `HTTP_${statusCode}`;
  return error;
}
