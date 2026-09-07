import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'fallback_development_secret_key_not_for_production';
};

export const signToken = (payload: TokenPayload): string => {
  let rawExpiresIn = process.env.JWT_EXPIRES_IN;
  let expiresIn: any = '7d';

  if (rawExpiresIn && typeof rawExpiresIn === 'string' && rawExpiresIn.trim() !== '') {
    const cleaned = rawExpiresIn.trim().replace(/^['"]|['"]$/g, '');
    if (cleaned.length > 0) {
      expiresIn = cleaned;
    }
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
