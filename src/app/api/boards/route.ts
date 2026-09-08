import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'central', 'state', 'open'
    const q = searchParams.get('q');

    let sql = `
      SELECT
        b.id,
        b.name,
        b.short_name,
        b.slug,
        b.board_type,
        b.state_name,
        b.official_website,
        b.official_domain,
        b.classes_covered,
        b.grading_system,
        b.supplementary_exam_name,
        b.revaluation_process_info,
        b.pattern_summary,
        b.practical_exam_info,
        b.helpline_number,
        b.is_verified,
        b.last_verified_at
      FROM boards b
      WHERE b.is_verified = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      sql += ` AND b.board_type = $${paramIndex++}`;
      params.push(type);
    }

    if (q) {
      sql += ` AND (b.name ILIKE $${paramIndex} OR b.short_name ILIKE $${paramIndex} OR b.state_name ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY b.board_type ASC, b.short_name ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (err: any) {
    console.error('API /boards Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
