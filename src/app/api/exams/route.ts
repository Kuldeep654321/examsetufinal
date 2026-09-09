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
        ) as category
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

    // Fetch events for these exams
    const eventsRes = await query(`
      SELECT
        id, exam_id, event_type, title, start_date, end_date,
        is_extended, previous_end_date, status, official_source_url, notes
      FROM exam_events
    `);

    // Fetch latest updates
    const updatesRes = await query(`
      SELECT exam_id, title, summary, update_type, published_at, is_breaking
      FROM exam_updates
      ORDER BY published_at DESC
    `);

    const data = res.rows.map((exam: any) => {
      const examEvents = eventsRes.rows.filter((ev: any) => ev.exam_id === exam.id);
      const latestUpdate = updatesRes.rows.find((up: any) => up.exam_id === exam.id) || null;
      return {
        ...exam,
        events: examEvents,
        latest_update: latestUpdate,
      };
    });

    // Total count
    const countSql = `SELECT COUNT(*) as total FROM exams WHERE is_active = true`;
    const countRes = await query(countSql);
    const total = parseInt(countRes.rows[0].total, 10);

    return NextResponse.json({
      success: true,
      data,
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
