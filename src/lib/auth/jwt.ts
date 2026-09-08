import jwt from 'jsonwebtoken';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'examsetu-super-secret-jwt-key-2026-prod';
const EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
