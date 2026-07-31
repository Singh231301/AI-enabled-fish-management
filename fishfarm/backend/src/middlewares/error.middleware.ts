import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response.utils';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    err.errors.forEach(e => {
      const path = e.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(e.message);
    });
    return sendError(res, 'Validation failed', 422, fieldErrors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return sendError(res, 'Resource already exists', 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Resource not found', 404);
    }
    return sendError(res, 'Database error', 500);
  }

  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  const errors = env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;

  return sendError(res, message, 500, errors);
};
