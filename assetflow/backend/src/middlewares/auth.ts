import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(AppError.unauthorized('Access token is missing or invalid'));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('Access denied: insufficient permissions'));
    }

    next();
  };
}
