import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const stream = searchParams.get('stream');
    const state = searchParams.get('state');
    const level = searchParams.get('level');
    const status = searchParams.get('status');
    const q = searchParams.get('q');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        e.id,
        e.slug,
        e.title,
        e.short_title,
        e.level,
        e.stream_eligibility,
        e.min_age,
        e.max_age,
        e.eligibility_criteria,
        e.exam_frequency,
        e.official_website_url,
        e.registration_url,
        e.is_featured,
        e.last_verified_at,
        e.created_at,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'short_name', o.short_name,
          'slug', o.slug,
          'official_domain', o.official_domain,
          'logo_url', o.logo_url
        ) as conducting_org,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'icon', c.icon
        ) as category,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ev.id,
                'event_type', ev.event_type,
                'title', ev.title,
                'start_date', ev.start_date,
                'end_date', ev.end_date,
                'is_extended', ev.is_extended,
                'previous_end_date', ev.previous_end_date,
                'status', (
                  CASE
                    WHEN ev.status = 'unannounced' OR (ev.start_date IS NULL AND ev.end_date IS NULL) THEN 'unannounced'
                    WHEN ev.status = 'delayed' THEN 'delayed'
                    WHEN ev.end_date IS NOT NULL AND CURRENT_DATE > ev.end_date THEN 'completed'
                    WHEN ev.end_date IS NOT NULL AND CURRENT_DATE >= ev.end_date - INTERVAL '3 days' AND CURRENT_DATE <= ev.end_date THEN 'closing_soon'
                    WHEN (ev.start_date IS NOT NULL AND CURRENT_DATE >= ev.start_date AND (ev.end_date IS NULL OR CURRENT_DATE <= ev.end_date)) THEN 'open'
                    WHEN ev.start_date IS NOT NULL AND CURRENT_DATE < ev.start_date THEN 'upcoming'
                    ELSE ev.status
                  END
                ),
                'official_source_url', ev.official_source_url,
                'notes', ev.notes
              ) ORDER BY
                (CASE
                  WHEN ev.start_date IS NOT NULL AND CURRENT_DATE >= ev.start_date AND (ev.end_date IS NULL OR CURRENT_DATE <= ev.end_date) THEN 1
                  WHEN ev.end_date IS NOT NULL AND CURRENT_DATE >= ev.end_date - INTERVAL '3 days' AND CURRENT_DATE <= ev.end_date THEN 1
                  WHEN ev.start_date IS NOT NULL AND CURRENT_DATE < ev.start_date THEN 2
                  ELSE 3
                END),
                ev.start_date ASC NULLS LAST
            )
            FROM exam_events ev
            WHERE ev.exam_id = e.id
          ), '[]'::json
        ) as events,
        (
          SELECT json_build_object(
            'title', up.title,
            'summary', up.summary,
            'update_type', up.update_type,
            'published_at', up.published_at,
            'is_breaking', up.is_breaking
          )
          FROM exam_updates up
          WHERE up.exam_id = e.id
          ORDER BY up.published_at DESC
          LIMIT 1
        ) as latest_update
      FROM exams e
      JOIN organizations o ON e.conducting_org_id = o.id
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN states s ON e.state_id = s.id
      WHERE e.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (level) {
      sql += ` AND LOWER(e.level) = LOWER($${paramIndex++})`;
      params.push(level);
    }

    if (featured === 'true') {
      sql += ` AND e.is_featured = true`;
    }

    if (stream && stream !== 'all') {
      sql += ` AND (e.stream_eligibility @> $${paramIndex++}::jsonb OR e.stream_eligibility @> '["Any"]'::jsonb)`;
      params.push(JSON.stringify([stream]));
    }

    if (q) {
      sql += ` AND (
        e.title ILIKE $${paramIndex} OR
        e.short_title ILIKE $${paramIndex} OR
        o.name ILIKE $${paramIndex} OR
        o.short_name ILIKE $${paramIndex}
      )`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    // Sorting: prioritize featured & recent updates
    sql += ` ORDER BY e.is_featured DESC, e.last_verified_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const res = await query(sql, params);

    // Total count
    const countSql = `SELECT COUNT(*) as total FROM exams WHERE is_active = true`;
    const countRes = await query(countSql);
    const total = parseInt(countRes.rows[0].total, 10);

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
    console.error('API /exams Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
