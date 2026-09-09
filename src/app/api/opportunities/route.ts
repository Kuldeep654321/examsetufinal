import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const q = searchParams.get('q');
    const stream = searchParams.get('stream');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        opp.id,
        opp.slug,
        opp.title,
        opp.opp_type,
        opp.description,
        opp.eligibility,
        opp.qualification,
        opp.min_age,
        opp.max_age,
        opp.location,
        opp.stream,
        opp.application_start,
        opp.application_deadline,
        opp.is_deadline_extended,
        opp.previous_deadline,
        opp.benefits,
        opp.financial_aid_amount,
        opp.vacancies_count,
        opp.salary_range,
        opp.stipend_amount,
        opp.department,
        opp.role_designation,
        opp.application_process,
        opp.official_source_url,
        opp.official_portal_link,
        opp.documents_required,
        (
          CASE
            WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE > opp.application_deadline THEN 'closed'::opp_status
            WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE >= opp.application_deadline - INTERVAL '3 days' AND CURRENT_DATE <= opp.application_deadline THEN 'closing_soon'::opp_status
            WHEN (opp.application_start IS NOT NULL AND CURRENT_DATE >= opp.application_start AND (opp.application_deadline IS NULL OR CURRENT_DATE <= opp.application_deadline)) THEN 'open'::opp_status
            WHEN opp.application_start IS NOT NULL AND CURRENT_DATE < opp.application_start THEN 'upcoming'::opp_status
            ELSE opp.status
          END
        ) as status,
        opp.last_verified_at,
        opp.is_featured,
        opp.created_at,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'short_name', o.short_name,
          'slug', o.slug,
          'official_domain', o.official_domain,
          'logo_url', o.logo_url
        ) as org
      FROM opportunities opp
      JOIN organizations o ON opp.org_id = o.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      sql += ` AND opp.opp_type = $${paramIndex++}`;
      params.push(type);
    }

    if (status && status !== 'all') {
      sql += ` AND opp.status = $${paramIndex++}`;
      params.push(status);
    }

    if (featured === 'true') {
      sql += ` AND opp.is_featured = true`;
    }

    if (stream && stream !== 'all') {
      sql += ` AND (opp.stream @> $${paramIndex++}::jsonb OR opp.stream @> '["Any"]'::jsonb)`;
      params.push(JSON.stringify([stream]));
    }

    if (q) {
      sql += ` AND (
        opp.title ILIKE $${paramIndex} OR
        opp.description ILIKE $${paramIndex} OR
        opp.qualification ILIKE $${paramIndex} OR
        opp.department ILIKE $${paramIndex} OR
        opp.role_designation ILIKE $${paramIndex} OR
        o.name ILIKE $${paramIndex}
      )`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY opp.is_featured DESC, opp.application_deadline ASC NULLS LAST LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const res = await query(sql, params);

    const countSql = type && type !== 'all'
      ? `SELECT COUNT(*) as total FROM opportunities WHERE opp_type = $1`
      : `SELECT COUNT(*) as total FROM opportunities`;
    const countParams = type && type !== 'all' ? [type] : [];
    const countRes = await query(countSql, countParams);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    return NextResponse.json({
      success: true,
      data: res.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('API /opportunities Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
