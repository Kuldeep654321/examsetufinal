import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { NotificationDispatcher } from '@/lib/notifications/dispatcher';
import { z } from 'zod';

const manualUpdateSchema = z.object({
  exam_id: z.string().uuid(),
  title: z.string().min(5),
  summary: z.string().min(10),
  update_type: z.enum(['date_extended', 'admit_card_out', 'result_declared', 'syllabus_updated', 'pattern_changed', 'new_cycle', 'correction_opened', 'general']),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  official_source_url: z.string().url(),
  official_doc_ref: z.string().optional(),
  is_breaking: z.boolean().default(false),
  update_event: z.object({
    event_type: z.string(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    is_extended: z.boolean().optional(),
    status: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin', 'verifier']);
    if (authRes instanceof NextResponse) return authRes;
    const user = (authRes as any).user;

    const body = await req.json();
    const validated = manualUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 });
    }

    const data = validated.data;

    // 1. Insert Exam Update
    const updateRes = await query(
      `INSERT INTO exam_updates (
        exam_id, title, summary, old_value, new_value, update_type,
        official_source_url, official_doc_ref, is_breaking, verified_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.exam_id,
        data.title,
        data.summary,
        data.old_value || null,
        data.new_value || null,
        data.update_type,
        data.official_source_url,
        data.official_doc_ref || null,
        data.is_breaking,
        user.id,
      ]
    );

    // 2. Optionally update exam event date / status
    if (data.update_event && data.update_event.event_type) {
      await query(
        `UPDATE exam_events SET
          start_date = COALESCE($1, start_date),
          end_date = COALESCE($2, end_date),
          is_extended = COALESCE($3, is_extended),
          status = COALESCE($4, status)::event_status,
          official_source_url = $5,
          last_verified_at = NOW(),
          updated_at = NOW()
         WHERE exam_id = $6 AND event_type = $7::event_type`,
        [
          data.update_event.start_date || null,
          data.update_event.end_date || null,
          data.update_event.is_extended || false,
          data.update_event.status || null,
          data.official_source_url,
          data.exam_id,
          data.update_event.event_type,
        ]
      );
    }

    // 3. Update exam last_verified_at
    await query('UPDATE exams SET last_verified_at = NOW(), updated_at = NOW() WHERE id = $1', [data.exam_id]);

    // 4. Audit Log
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_state)
       VALUES ($1, 'MANUAL_EXAM_UPDATE', 'exam_update', $2, $3)`,
      [user.id, updateRes.rows[0].id, JSON.stringify(data)]
    );

    // 5. Dispatch Notifications
    const examRes = await query('SELECT slug, title FROM exams WHERE id = $1', [data.exam_id]);
    const examSlug = examRes.rows[0]?.slug || '';

    await NotificationDispatcher.dispatchToRelevantStudents({
      title: data.title,
      message: data.summary,
      link: `/exams/${examSlug}`,
      type: data.update_type === 'date_extended' ? 'deadline' : 'exam_alert',
      targetExamId: data.exam_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Verified update published successfully & student alerts dispatched!',
      data: updateRes.rows[0],
    });
  } catch (err: any) {
    console.error('API /admin/manual-update Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
