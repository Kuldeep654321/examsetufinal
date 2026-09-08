import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  class_level: z.string().optional(),
  board: z.string().optional(),
  state: z.string().optional(),
  stream: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  target_exams: z.array(z.string()).optional(),
  career_interests: z.array(z.string()).optional(),
  phone_number: z.string().optional(),
  notification_preferences: z.record(z.boolean()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileRes.rows[0] || null;

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        profile,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 });
    }

    const data = validated.data;

    if (data.full_name) {
      await query('UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2', [data.full_name, user.id]);
    }

    await query(
      `INSERT INTO profiles (user_id, class_level, board, state, stream, subjects, target_exams, career_interests, phone_number, notification_preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         class_level = COALESCE($2, profiles.class_level),
         board = COALESCE($3, profiles.board),
         state = COALESCE($4, profiles.state),
         stream = COALESCE($5, profiles.stream),
         subjects = COALESCE($6, profiles.subjects),
         target_exams = COALESCE($7, profiles.target_exams),
         career_interests = COALESCE($8, profiles.career_interests),
         phone_number = COALESCE($9, profiles.phone_number),
         notification_preferences = COALESCE($10, profiles.notification_preferences),
         updated_at = NOW()`,
      [
        user.id,
        data.class_level || null,
        data.board || null,
        data.state || null,
        data.stream || null,
        data.subjects ? JSON.stringify(data.subjects) : null,
        data.target_exams ? JSON.stringify(data.target_exams) : null,
        data.career_interests ? JSON.stringify(data.career_interests) : null,
        data.phone_number || null,
        data.notification_preferences ? JSON.stringify(data.notification_preferences) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
