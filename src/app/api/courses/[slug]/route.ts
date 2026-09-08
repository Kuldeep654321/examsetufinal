import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const res = await query(
      `SELECT
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
        c.last_verified_at,
        c.created_at
      FROM courses c
      WHERE c.slug = $1 AND c.is_verified = true`,
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (err: any) {
    console.error('API /courses/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
