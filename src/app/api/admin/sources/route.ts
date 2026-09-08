import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { sourceRegistry } from '@/lib/sources/registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin', 'verifier']);
    if (authRes instanceof NextResponse) return authRes;

    const res = await query(`
      SELECT
        s.id,
        s.name,
        s.official_domain,
        s.base_url,
        s.source_type,
        s.adapter_name,
        s.check_interval_minutes,
        s.is_enabled,
        s.health_status,
        s.last_successful_fetch,
        s.last_failed_fetch,
        s.failure_count,
        s.response_time_ms,
        s.error_message,
        s.created_at,
        s.updated_at,
        o.name as org_name,
        o.short_name as org_short_name
      FROM sources s
      JOIN organizations o ON s.org_id = o.id
      ORDER BY s.is_enabled DESC, s.name ASC
    `);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin']);
    if (authRes instanceof NextResponse) return authRes;
    const user = (authRes as any).user;

    const body = await req.json();
    const { sourceId, is_enabled, triggerFetch } = body;

    if (!sourceId) {
      return NextResponse.json({ success: false, error: 'sourceId required' }, { status: 400 });
    }

    if (triggerFetch) {
      // Trigger instant fetch on this specific adapter
      const sourceRes = await query('SELECT * FROM sources WHERE id = $1', [sourceId]);
      if (sourceRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 });
      }

      const source = sourceRes.rows[0];
      const adapter = sourceRegistry.get(source.adapter_name);
      if (!adapter) {
        return NextResponse.json({ success: false, error: 'Adapter not implemented' }, { status: 404 });
      }

      const fetchRes = await adapter.fetchAnnouncements();

      await query(
        `UPDATE sources SET
          health_status = $1,
          response_time_ms = $2,
          last_successful_fetch = CASE WHEN $3 = true THEN NOW() ELSE last_successful_fetch END,
          last_failed_fetch = CASE WHEN $3 = false THEN NOW() ELSE last_failed_fetch END,
          failure_count = CASE WHEN $3 = true THEN 0 ELSE failure_count + 1 END,
          error_message = $4,
          updated_at = NOW()
         WHERE id = $5`,
        [
          fetchRes.success ? 'healthy' : 'failed',
          fetchRes.responseTimeMs,
          fetchRes.success,
          fetchRes.errorMessage || null,
          source.id,
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Fetched source: detected ${fetchRes.items.length} items with status ${fetchRes.statusCode}.`,
        fetchResult: fetchRes,
      });
    }

    if (typeof is_enabled === 'boolean') {
      await query('UPDATE sources SET is_enabled = $1, updated_at = NOW() WHERE id = $2', [is_enabled, sourceId]);
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_state)
         VALUES ($1, 'TOGGLE_SOURCE', 'source', $2, $3)`,
        [user.id, sourceId, JSON.stringify({ is_enabled })]
      );
    }

    return NextResponse.json({ success: true, message: 'Source updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
