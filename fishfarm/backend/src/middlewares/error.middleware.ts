import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response.utils';
import { z, ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err instanceof z.ZodError) {
    const formattedErrors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
    sendError(res, 'Validation Error', 400, formattedErrors);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
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
