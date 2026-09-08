import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/middleware';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const userRes = await query(
      `SELECT id, email, password_hash, full_name, role, avatar_url, email_verified
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    // Fetch profile
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileRes.rows[0] || null;

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
      profile,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: sanitizedUser,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Login API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
