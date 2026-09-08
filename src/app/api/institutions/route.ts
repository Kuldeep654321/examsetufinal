import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const state = searchParams.get('state');
    const exam = searchParams.get('exam');
    const q = searchParams.get('q');

    let sql = `
      SELECT
        i.id,
        i.name,
        i.short_name,
        i.slug,
        i.institution_type,
        i.state_name,
        i.city,
        i.official_website,
        i.affiliation,
        i.recognized_by,
        i.accepted_exams,
        i.counselling_authorities,
        i.courses_offered,
        i.campus_overview,
        i.is_verified,
        i.last_verified_at
      FROM institutions i
      WHERE i.is_verified = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      sql += ` AND i.institution_type = $${paramIndex++}`;
      params.push(type);
    }

    if (state && state !== 'all') {
      sql += ` AND i.state_name ILIKE $${paramIndex++}`;
      params.push(`%${state}%`);
    }

    if (exam && exam !== 'all') {
      sql += ` AND i.accepted_exams @> $${paramIndex++}::jsonb`;
      params.push(JSON.stringify([exam]));
    }

    if (q) {
      sql += ` AND (i.name ILIKE $${paramIndex} OR i.short_name ILIKE $${paramIndex} OR i.city ILIKE $${paramIndex} OR i.state_name ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY i.name ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (err: any) {
    console.error('API /institutions Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
