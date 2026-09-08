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
        opp.status,
        opp.last_verified_at,
        opp.is_featured,
        opp.created_at,
        opp.updated_at,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'short_name', o.short_name,
          'slug', o.slug,
          'official_domain', o.official_domain,
          'description', o.description,
          'logo_url', o.logo_url,
          'official_portal_url', o.official_portal_url,
          'contact_email', o.contact_email,
          'is_verified', o.is_verified
        ) as org,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'code', s.code
        ) as state
      FROM opportunities opp
      JOIN organizations o ON opp.org_id = o.id
      LEFT JOIN states s ON opp.state_id = s.id
      WHERE opp.slug = $1`,
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (err: any) {
    console.error('API /opportunities/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
