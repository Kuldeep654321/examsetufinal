import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin', 'verifier']);
    if (authRes instanceof NextResponse) return authRes;

    // 1. Pending Review Items Count
    const pendingReviewRes = await query(
      "SELECT COUNT(*) as count FROM review_queue WHERE review_status = 'pending'"
    );

    // 2. Sources Health Breakdown
    const sourcesHealthRes = await query(`
      SELECT
        COUNT(*) as total_sources,
        COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy,
        COUNT(*) FILTER (WHERE health_status = 'layout_changed') as layout_changed,
        COUNT(*) FILTER (WHERE health_status = 'failed') as failed,
        AVG(response_time_ms) as avg_response_time_ms
      FROM sources
    `);

    // 3. Database Counts
    const examsCountRes = await query('SELECT COUNT(*) as count FROM exams');
    const oppsCountRes = await query('SELECT COUNT(*) as count FROM opportunities');
    const usersCountRes = await query('SELECT COUNT(*) as count FROM users');
    const updatesCountRes = await query('SELECT COUNT(*) as count FROM exam_updates');

    // 4. Recent Fetch Logs
    const recentLogsRes = await query(`
      SELECT
        l.id,
        l.status_code,
        l.response_time_ms,
        l.content_changed,
        l.items_detected,
        l.error_message,
        l.fetched_at,
        s.name as source_name,
        s.adapter_name
      FROM source_fetch_logs l
      JOIN sources s ON l.source_id = s.id
      ORDER BY l.fetched_at DESC
      LIMIT 10
    `);

    // 5. Recent Review Queue Items
    const recentQueueRes = await query(`
      SELECT
        rq.id,
        rq.document_title,
        rq.target_entity_type,
        rq.ai_confidence,
        rq.review_status,
        rq.created_at,
        s.name as source_name
      FROM review_queue rq
      JOIN sources s ON rq.source_id = s.id
      ORDER BY rq.created_at DESC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      data: {
        pendingReviews: parseInt(pendingReviewRes.rows[0].count, 10),
        sourcesHealth: {
          total: parseInt(sourcesHealthRes.rows[0].total_sources, 10),
          healthy: parseInt(sourcesHealthRes.rows[0].healthy, 10),
          layoutChanged: parseInt(sourcesHealthRes.rows[0].layout_changed, 10),
          failed: parseInt(sourcesHealthRes.rows[0].failed, 10),
          avgResponseTimeMs: Math.round(parseFloat(sourcesHealthRes.rows[0].avg_response_time_ms || '0')),
        },
        counts: {
          exams: parseInt(examsCountRes.rows[0].count, 10),
          opportunities: parseInt(oppsCountRes.rows[0].count, 10),
          users: parseInt(usersCountRes.rows[0].count, 10),
          updates: parseInt(updatesCountRes.rows[0].count, 10),
        },
        recentLogs: recentLogsRes.rows,
        recentQueue: recentQueueRes.rows,
      },
    });
  } catch (err: any) {
    console.error('API /admin/overview Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
