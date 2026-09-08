import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const trackerSchema = z.object({
  target_type: z.enum(['exam', 'opportunity']),
  target_id: z.string().uuid(),
  status: z.enum(['interested', 'will_apply', 'applied', 'admit_card_received', 'exam_completed', 'result_available']),
  application_number: z.string().optional(),
  roll_number: z.string().optional(),
  exam_date: z.string().optional().nullable(),
  exam_center: z.string().optional(),
  private_notes: z.string().optional(),
  documents_checklist: z.array(z.object({ name: z.string(), completed: z.boolean() })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await query(
      `SELECT
        t.id,
        t.target_type,
        t.target_id,
        t.status,
        t.application_number,
        t.roll_number,
        t.exam_date,
        t.exam_center,
        t.private_notes,
        t.documents_checklist,
        t.created_at,
        t.updated_at,
        CASE
          WHEN t.target_type = 'exam' THEN (SELECT title FROM exams WHERE id = t.target_id)
          ELSE (SELECT title FROM opportunities WHERE id = t.target_id)
        END as target_title,
        CASE
          WHEN t.target_type = 'exam' THEN (SELECT slug FROM exams WHERE id = t.target_id)
          ELSE (SELECT slug FROM opportunities WHERE id = t.target_id)
        END as target_slug
      FROM application_tracker t
      WHERE t.user_id = $1
      ORDER BY t.updated_at DESC`,
      [user.id]
    );

    return NextResponse.json({ success: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = trackerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 });
    }

    const data = validated.data;

    const res = await query(
      `INSERT INTO application_tracker (
        user_id, target_type, target_id, status, application_number,
        roll_number, exam_date, exam_center, private_notes, documents_checklist
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id, target_type, target_id) DO UPDATE SET
        status = EXCLUDED.status,
        application_number = EXCLUDED.application_number,
        roll_number = EXCLUDED.roll_number,
        exam_date = EXCLUDED.exam_date,
        exam_center = EXCLUDED.exam_center,
        private_notes = EXCLUDED.private_notes,
        documents_checklist = EXCLUDED.documents_checklist,
        updated_at = NOW()
      RETURNING *`,
      [
        user.id,
        data.target_type,
        data.target_id,
        data.status,
        data.application_number || null,
        data.roll_number || null,
        data.exam_date || null,
        data.exam_center || null,
        data.private_notes || null,
        JSON.stringify(data.documents_checklist || []),
      ]
    );

    return NextResponse.json({ success: true, message: 'Application tracker updated', data: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    await query('DELETE FROM application_tracker WHERE id = $1 AND user_id = $2', [id, user.id]);
    return NextResponse.json({ success: true, message: 'Removed from tracker' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
