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
        b.last_verified_at,
        b.created_at
      FROM boards b
      WHERE b.slug = $1 AND b.is_verified = true`,
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Education Board not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (err: any) {
    console.error('API /boards/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
