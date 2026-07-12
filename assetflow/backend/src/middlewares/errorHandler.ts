import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';
import { config } from '../config';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint
        statusCode = 409;
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        message = `Conflict: A record with this ${target} already exists.`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = err.message || 'The requested record was not found.';
        break;
      default:
        statusCode = 400;
        message = `Database Error: ${err.message}`;
    }
  }
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Database validation failed. Please check input parameters.';
  }
  // Handle other unknown errors
  else {
    if (config.nodeEnv === 'development') {
      message = err.message || String(err);
      errors = err.stack;
    } else {
      message = 'An unexpected error occurred';
    }
  }

  // Log non-operational/internal errors
  if (statusCode === 500) {
    console.error('💥 ERROR:', err);
  }

  const response: any = errorResponse(message, errors);
  if (err.data) {
    response.data = err.data;
  }

  res.status(statusCode).json(response);
}
