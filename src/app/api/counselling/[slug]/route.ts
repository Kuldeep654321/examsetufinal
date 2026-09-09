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
        ca.last_verified_at
      FROM counselling_authorities ca
      WHERE ca.slug = $1`,
      [slug]
    );

    if (authRes.rows.length > 0) {
      const auth = authRes.rows[0];
      const procRes = await query(
        `SELECT
          id, title, slug, cycle_year, official_portal_url, notification_url,
          process_overview, eligibility_summary, reservation_summary,
          rounds_structure, step_by_step_process, required_documents,
          seat_matrix_info, fees_info, status
        FROM counselling_processes
        WHERE authority_id = $1 OR authority_id = $2`,
        [auth.id, auth.slug]
      );

      return NextResponse.json({
        success: true,
        type: 'authority',
        data: {
          ...auth,
          processes: procRes.rows,
        },
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
        cp.last_verified_at
      FROM counselling_processes cp
      WHERE cp.slug = $1`,
      [slug]
    );

    if (procRes.rows.length > 0) {
      const proc = procRes.rows[0];
      const authorityRes = await query(
        `SELECT
          id, name, short_name, slug, stream, jurisdiction, conducting_body,
          official_website, official_domain, helpline_number, contact_email
        FROM counselling_authorities
        WHERE id = $1 OR slug = $1`,
        [proc.authority_id]
      );

      return NextResponse.json({
        success: true,
        type: 'process',
        data: {
          ...proc,
          authority: authorityRes.rows[0] || null,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Counselling authority or process not found' }, { status: 404 });
  } catch (err: any) {
    console.error('API /counselling/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
