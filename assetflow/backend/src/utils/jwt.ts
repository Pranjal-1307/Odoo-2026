import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config';

interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  userId: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
}
