import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';
import { query } from '@/lib/db';
import { User } from '@/types';

export const AUTH_COOKIE_NAME = 'examsetu_session';

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check cookie
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) return cookie;

  // Check Authorization header: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function getCurrentUser(req: NextRequest): Promise<User | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const res = await query(
      `SELECT id, email, full_name, role, avatar_url, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [payload.userId]
    );

    if (res.rows.length === 0) return null;
    return res.rows[0] as User;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<{ user: User } | NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }
  return { user };
}

export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<{ user: User } | NextResponse> {
  const authRes = await requireAuth(req);
  if (authRes instanceof NextResponse) return authRes;

  const { user } = authRes;
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden. Insufficient permissions.' },
      { status: 403 }
    );
  }

  return { user };
}
