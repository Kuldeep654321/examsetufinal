import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // First try matching counselling authority slug
    const authRes = await query(
      `SELECT
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
                'official_portal_url', cp.official_portal_url,
                'notification_url', cp.notification_url,
                'process_overview', cp.process_overview,
                'eligibility_summary', cp.eligibility_summary,
                'reservation_summary', cp.reservation_summary,
                'rounds_structure', cp.rounds_structure,
                'step_by_step_process', cp.step_by_step_process,
                'required_documents', cp.required_documents,
                'seat_matrix_info', cp.seat_matrix_info,
                'fees_info', cp.fees_info,
                'status', cp.status
              )
            )
            FROM counselling_processes cp
            WHERE cp.authority_id = ca.id
          ), '[]'::json
        ) as processes
      FROM counselling_authorities ca
      WHERE ca.slug = $1`,
      [slug]
    );

    if (authRes.rows.length > 0) {
      return NextResponse.json({
        success: true,
        type: 'authority',
        data: authRes.rows[0],
      });
    }

    // Try matching counselling process slug directly
    const procRes = await query(
      `SELECT
        cp.id,
        cp.authority_id,
        cp.cycle_year,
        cp.title,
        cp.slug,
        cp.official_portal_url,
        cp.notification_url,
        cp.process_overview,
        cp.eligibility_summary,
        cp.reservation_summary,
        cp.rounds_structure,
        cp.step_by_step_process,
        cp.required_documents,
        cp.seat_matrix_info,
        cp.fees_info,
        cp.status,
        cp.last_verified_at,
        json_build_object(
          'id', ca.id,
          'name', ca.name,
          'short_name', ca.short_name,
          'slug', ca.slug,
          'stream', ca.stream,
          'jurisdiction', ca.jurisdiction,
          'official_website', ca.official_website,
          'official_domain', ca.official_domain,
          'helpline_number', ca.helpline_number,
          'contact_email', ca.contact_email
        ) as authority
      FROM counselling_processes cp
      JOIN counselling_authorities ca ON cp.authority_id = ca.id
      WHERE cp.slug = $1`,
      [slug]
    );

    if (procRes.rows.length > 0) {
      return NextResponse.json({
        success: true,
        type: 'process',
        data: procRes.rows[0],
      });
    }

    return NextResponse.json({ success: false, error: 'Counselling authority or process not found' }, { status: 404 });
  } catch (err: any) {
    console.error('API /counselling/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
