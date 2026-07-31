import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './app-error';

interface JwtPayload {
  userId: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}
