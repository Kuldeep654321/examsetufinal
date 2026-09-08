import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level'); // 'UG', 'PG', 'Diploma', 'Integrated'
    const stream = searchParams.get('stream');
    const q = searchParams.get('q');

    let sql = `
      SELECT
        c.id,
        c.name,
        c.short_name,
        c.slug,
        c.degree_level,
        c.stream,
        c.duration_years,
        c.eligibility_summary,
        c.stream_prerequisites,
        c.lateral_entry_available,
        c.regulatory_body,
        c.accepted_entrance_exams,
        c.counselling_routes,
        c.career_scope,
        c.top_specializations,
        c.is_verified,
        c.last_verified_at
      FROM courses c
      WHERE c.is_verified = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (level && level !== 'all') {
      sql += ` AND LOWER(c.degree_level) = LOWER($${paramIndex++})`;
      params.push(level);
    }

    if (stream && stream !== 'all') {
      sql += ` AND c.stream ILIKE $${paramIndex++}`;
      params.push(`%${stream}%`);
    }

    if (q) {
      sql += ` AND (c.name ILIKE $${paramIndex} OR c.short_name ILIKE $${paramIndex} OR c.career_scope ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY c.degree_level ASC, c.name ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (err: any) {
    console.error('API /courses Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
