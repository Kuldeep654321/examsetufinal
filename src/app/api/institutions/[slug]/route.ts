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
        i.last_verified_at,
        i.created_at
      FROM institutions i
      WHERE i.slug = $1 AND i.is_verified = true`,
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (err: any) {
    console.error('API /institutions/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
