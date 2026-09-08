import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../src/lib/auth/jwt';
import { hashPassword, comparePassword } from '../src/lib/auth/password';

describe('Auth & Password Security', () => {
  it('should hash password and verify matching hash correctly', async () => {
    const raw = 'ExamAdmin@2026';
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    const matches = await comparePassword(raw, hashed);
    expect(matches).toBe(true);

    const wrongMatches = await comparePassword('WrongPassword', hashed);
    expect(wrongMatches).toBe(false);
  });

  it('should sign and verify JWT tokens containing user role', () => {
    const payload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@examsetu.in',
      role: 'admin' as const,
      fullName: 'Chief Administrator',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe('admin');
  });
});
