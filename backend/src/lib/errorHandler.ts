import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ErrorCode, handlePrismaError, InternalServerError } from './errors';
import { logger } from './logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

export function errorHandler(
  error: Error | FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const timestamp = new Date().toISOString();
  const path = request.url;

  // Log the error
  logger.error('Request error', error, {
    method: request.method,
    path,
    query: request.query,
  });

  // Handle known error types
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.toJSON(),
      timestamp,
      path,
    };
    return reply.status(error.statusCode).send(response);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      timestamp,
      path,
    };
    return reply.status(400).send(response);
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const appError = handlePrismaError(error);
    const response: ErrorResponse = {
      error: appError.toJSON(),
      timestamp,
      path,
    };
    return reply.status(appError.statusCode).send(response);
  }

  // Handle Fastify errors
  if ('statusCode' in error && error.statusCode) {
    const response: ErrorResponse = {
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: error.message,
      },
      timestamp,
      path,
    };
    return reply.status(error.statusCode).send(response);
  }

  // Default to internal server error
  const internalError = new InternalServerError();
  const response: ErrorResponse = {
    error: internalError.toJSON(),
    timestamp,
    path,
  };

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    response.error.details = undefined;
  }

  return reply.status(500).send(response);
}
