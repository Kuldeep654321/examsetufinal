import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/middleware';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  class_level: z.string().optional(),
  board: z.string().optional(),
  state: z.string().optional(),
  stream: z.string().optional(),
  target_exams: z.array(z.string()).optional(),
  career_interests: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, full_name, class_level, board, state, stream, target_exams, career_interests } = validated.data;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const userRes = await query(
      `INSERT INTO users (email, password_hash, full_name, role, email_verified)
       VALUES ($1, $2, $3, 'student', true)
       RETURNING id, email, full_name, role, avatar_url, created_at`,
      [email.toLowerCase().trim(), passwordHash, full_name.trim()]
    );

    const newUser = userRes.rows[0];

    // Create profile
    await query(
      `INSERT INTO profiles (user_id, class_level, board, state, stream, target_exams, career_interests)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newUser.id,
        class_level || '12',
        board || 'CBSE',
        state || 'Madhya Pradesh',
        stream || 'PCB',
        JSON.stringify(target_exams || []),
        JSON.stringify(career_interests || [])
      ]
    );

    // Create initial welcome notification
    await query(
      `INSERT INTO notifications (user_id, title, message, link, type)
       VALUES ($1, 'Welcome to ExamSetu!', 'Your student intelligence account has been created. Customize your target exams in the dashboard.', '/dashboard', 'system')`,
      [newUser.id]
    );

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.full_name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: newUser,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
