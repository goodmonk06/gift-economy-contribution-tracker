import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  ErrorCode,
  handlePrismaError,
} from './errors';

describe('Error Classes', () => {
  it('should create BadRequestError with correct properties', () => {
    const error = new BadRequestError('Invalid input');
    expect(error.code).toBe(ErrorCode.BAD_REQUEST);
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should create NotFoundError with resource name', () => {
    const error = new NotFoundError('User');
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create ValidationError with details', () => {
    const details = { field: 'email', message: 'Invalid format' };
    const error = new ValidationError('Validation failed', details);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.details).toEqual(details);
  });

  it('should serialize error to JSON', () => {
    const error = new BadRequestError('Test error', { field: 'test' });
    const json = error.toJSON();
    expect(json).toEqual({
      code: ErrorCode.BAD_REQUEST,
      message: 'Test error',
      details: { field: 'test' },
    });
  });
});

describe('handlePrismaError', () => {
  it('should handle unique constraint violation (P2002)', () => {
    const prismaError = {
      code: 'P2002',
      meta: { target: ['email'] },
      message: 'Unique constraint failed',
    };
    const appError = handlePrismaError(prismaError);
    expect(appError.code).toBe(ErrorCode.CONFLICT);
    expect(appError.statusCode).toBe(409);
  });

  it('should handle record not found (P2025)', () => {
    const prismaError = {
      code: 'P2025',
      message: 'Record not found',
    };
    const appError = handlePrismaError(prismaError);
    expect(appError.code).toBe(ErrorCode.NOT_FOUND);
    expect(appError.statusCode).toBe(404);
  });

  it('should handle foreign key constraint (P2003)', () => {
    const prismaError = {
      code: 'P2003',
      meta: { field_name: 'userId' },
      message: 'Foreign key constraint failed',
    };
    const appError = handlePrismaError(prismaError);
    expect(appError.code).toBe(ErrorCode.BAD_REQUEST);
  });

  it('should handle unknown Prisma errors as database errors', () => {
    const prismaError = {
      code: 'P9999',
      message: 'Unknown error',
    };
    const appError = handlePrismaError(prismaError);
    expect(appError.code).toBe(ErrorCode.DATABASE_ERROR);
    expect(appError.statusCode).toBe(500);
  });
});
