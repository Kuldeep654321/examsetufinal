import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get('stream');
    const q = searchParams.get('q');

    let sql = `
      SELECT
        ca.id,
        ca.name,
        ca.short_name,
        ca.slug,
        ca.stream,
        ca.jurisdiction,
        ca.conducting_body,
        ca.official_website,
        ca.official_domain,
        ca.description,
        ca.helpline_number,
        ca.contact_email,
        ca.is_verified,
        ca.last_verified_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', cp.id,
                'title', cp.title,
                'slug', cp.slug,
                'cycle_year', cp.cycle_year,
                'status', cp.status,
                'official_portal_url', cp.official_portal_url
              )
            )
            FROM counselling_processes cp
            WHERE cp.authority_id = ca.id
          ), '[]'::json
        ) as processes
      FROM counselling_authorities ca
      WHERE ca.is_verified = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (stream && stream !== 'all') {
      sql += ` AND ca.stream ILIKE $${paramIndex++}`;
      params.push(`%${stream}%`);
    }

    if (q) {
      sql += ` AND (ca.name ILIKE $${paramIndex} OR ca.short_name ILIKE $${paramIndex} OR ca.description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY ca.short_name ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (err: any) {
    console.error('API /counselling Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
