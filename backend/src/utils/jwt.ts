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
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
