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
        ca.last_verified_at
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

    const authRes = await query(sql, params);
    const procRes = await query(`
      SELECT id, authority_id, title, slug, cycle_year, status, official_portal_url
      FROM counselling_processes
    `);

    const data = authRes.rows.map((auth: any) => ({
      ...auth,
      processes: procRes.rows.filter((p: any) => p.authority_id === auth.id || p.authority_id === auth.slug),
    }));

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (err: any) {
    console.error('API /counselling Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
