import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin']);
    if (authRes instanceof NextResponse) return authRes;

    const res = await query(`
      SELECT
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.old_state,
        a.new_state,
        a.ip_address,
        a.created_at,
        u.email as user_email,
        u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
