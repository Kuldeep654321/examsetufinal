import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const actionSchema = z.object({
  queueId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'edit']),
  editedChanges: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin', 'verifier']);
    if (authRes instanceof NextResponse) return authRes;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    let sql = `
      SELECT
        rq.id,
        rq.document_url,
        rq.document_title,
        rq.target_entity_type,
        rq.target_entity_id,
        rq.extracted_data,
        rq.proposed_changes,
        rq.diff_summary,
        rq.ai_confidence,
        rq.ai_reasoning,
        rq.review_status,
        rq.review_notes,
        rq.reviewed_at,
        rq.created_at,
        s.name as source_name,
        s.official_domain,
        s.adapter_name,
        u.full_name as reviewer_name,
        CASE
          WHEN rq.target_entity_type = 'exam' OR rq.target_entity_type = 'exam_event' THEN
            (SELECT title FROM exams WHERE id = rq.target_entity_id)
          ELSE NULL
        END as target_entity_name
      FROM review_queue rq
      JOIN sources s ON rq.source_id = s.id
      LEFT JOIN users u ON rq.reviewed_by = u.id
    `;

    const params: any[] = [];
    if (status !== 'all') {
      sql += ` WHERE rq.review_status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY rq.created_at DESC`;

    const res = await query(sql, params);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin', 'verifier']);
    if (authRes instanceof NextResponse) return authRes;
    const user = (authRes as any).user;

    const body = await req.json();
    const validated = actionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 });
    }

    const { queueId, action, editedChanges, notes } = validated.data;

    const queueItemRes = await query('SELECT * FROM review_queue WHERE id = $1', [queueId]);
    if (queueItemRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Review item not found' }, { status: 404 });
    }

    const item = queueItemRes.rows[0];

    return await transaction(async (client) => {
      if (action === 'approve' || action === 'edit') {
        const changesToApply = action === 'edit' && editedChanges ? editedChanges : item.proposed_changes;

        // Apply changes to target entity
        if (item.target_entity_type === 'exam_event' && item.target_entity_id) {
          const eventType = item.extracted_data?.event_type || 'registration';

          // Update existing event or insert
          const existingEvent = await client.query(
            'SELECT id, end_date FROM exam_events WHERE exam_id = $1 AND event_type = $2 ORDER BY cycle_year DESC LIMIT 1',
            [item.target_entity_id, eventType]
          );

          if (existingEvent.rows.length > 0) {
            const ev = existingEvent.rows[0];
            await client.query(
              `UPDATE exam_events SET
                start_date = COALESCE($1, start_date),
                end_date = COALESCE($2, end_date),
                is_extended = COALESCE($3, is_extended),
                previous_end_date = COALESCE($4, previous_end_date),
                official_source_url = $5,
                last_verified_at = NOW(),
                updated_at = NOW()
               WHERE id = $6`,
              [
                changesToApply.start_date || null,
                changesToApply.end_date || null,
                changesToApply.is_extended || false,
                changesToApply.previous_end_date || ev.end_date,
                item.document_url,
                ev.id,
              ]
            );
          }

          // Create Exam Update log
          await client.query(
            `INSERT INTO exam_updates (
              exam_id, title, summary, old_value, new_value, update_type,
              official_source_url, official_doc_ref, is_breaking, verified_by_user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              item.target_entity_id,
              item.extracted_data?.title || item.document_title,
              item.extracted_data?.summary || 'Official update verified and approved.',
              item.diff_summary?.[0]?.old_value || null,
              item.diff_summary?.[0]?.new_value || null,
              item.extracted_data?.is_extension ? 'date_extended' : 'general',
              item.document_url,
              item.document_title,
              true,
              user.id,
            ]
          );
        }

        // Update Review Queue status
        await client.query(
          `UPDATE review_queue SET
            review_status = $1,
            reviewed_by = $2,
            review_notes = $3,
            reviewed_at = NOW()
           WHERE id = $4`,
          [action === 'approve' ? 'approved' : 'edited', user.id, notes || 'Verified and approved by admin', queueId]
        );

        // Audit Log
        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_state)
           VALUES ($1, $2, 'review_queue', $3, $4)`,
          [user.id, `REVIEW_${action.toUpperCase()}`, queueId, JSON.stringify(changesToApply)]
        );

        return NextResponse.json({
          success: true,
          message: `Update ${action === 'approve' ? 'approved' : 'edited and published'} successfully!`,
        });
      } else if (action === 'reject') {
        await client.query(
          `UPDATE review_queue SET
            review_status = 'rejected',
            reviewed_by = $1,
            review_notes = $2,
            reviewed_at = NOW()
           WHERE id = $3`,
          [user.id, notes || 'Rejected by verifier', queueId]
        );

        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
           VALUES ($1, 'REVIEW_REJECTED', 'review_queue', $2)`,
          [user.id, queueId]
        );

        return NextResponse.json({
          success: true,
          message: 'Review item rejected.',
        });
      }

      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    });
  } catch (err: any) {
    console.error('API /admin/review-queue Action Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
