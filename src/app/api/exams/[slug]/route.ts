import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const examRes = await query(
      `SELECT
        e.id,
        e.slug,
        e.title,
        e.short_title,
        e.level,
        e.stream_eligibility,
        e.min_age,
        e.max_age,
        e.age_relaxation,
        e.eligibility_criteria,
        e.exam_frequency,
        e.official_website_url,
        e.registration_url,
        e.syllabus_url,
        e.exam_pattern,
        e.important_documents,
        e.faqs,
        e.overview_article,
        e.selection_process,
        e.career_scope,
        e.preparation_tips,
        e.cutoffs_info,
        e.is_featured,
        e.last_verified_at,
        e.created_at,
        e.updated_at,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'short_name', o.short_name,
          'slug', o.slug,
          'official_domain', o.official_domain,
          'description', o.description,
          'logo_url', o.logo_url,
          'official_portal_url', o.official_portal_url,
          'helpline_number', o.helpline_number,
          'contact_email', o.contact_email,
          'is_verified', o.is_verified
        ) as conducting_org,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'icon', c.icon
        ) as category,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'code', s.code
        ) as state
      FROM exams e
      JOIN organizations o ON e.conducting_org_id = o.id
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN states s ON e.state_id = s.id
      WHERE (e.slug = $1 OR e.slug = $1 || '-2027' OR REPLACE(e.slug, '-2027', '') = $1) AND e.is_active = true
      LIMIT 1`,
      [slug]
    );

    if (examRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    const exam = examRes.rows[0];

    // Fetch Events with dynamic status calculation
    const eventsRes = await query(
      `SELECT
        id, cycle_year, event_type, title, start_date, end_date, is_extended, previous_end_date,
        (
          CASE
            WHEN status = 'unannounced' OR (start_date IS NULL AND end_date IS NULL) THEN 'unannounced'
            WHEN status = 'delayed' THEN 'delayed'
            WHEN end_date IS NOT NULL AND CURRENT_DATE > end_date THEN 'completed'
            WHEN end_date IS NOT NULL AND CURRENT_DATE >= end_date - INTERVAL '3 days' AND CURRENT_DATE <= end_date THEN 'closing_soon'
            WHEN (start_date IS NOT NULL AND CURRENT_DATE >= start_date AND (end_date IS NULL OR CURRENT_DATE <= end_date)) THEN 'open'
            WHEN start_date IS NOT NULL AND CURRENT_DATE < start_date THEN 'upcoming'
            ELSE status
          END
        ) as status,
        official_source_url, notification_doc_url, notes, last_verified_at
       FROM exam_events
       WHERE exam_id = $1
       ORDER BY
         (CASE
           WHEN start_date IS NOT NULL AND CURRENT_DATE >= start_date AND (end_date IS NULL OR CURRENT_DATE <= end_date) THEN 1
           WHEN start_date IS NOT NULL AND CURRENT_DATE < start_date THEN 2
           ELSE 3
         END),
         start_date ASC NULLS LAST`,
      [exam.id]
    );

    // Fetch Updates
    const updatesRes = await query(
      `SELECT id, title, summary, old_value, new_value, update_type, official_source_url, official_doc_ref, is_breaking, published_at
       FROM exam_updates
       WHERE exam_id = $1
       ORDER BY published_at DESC`,
      [exam.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...exam,
        events: eventsRes.rows,
        updates: updatesRes.rows,
      },
    });
  } catch (err: any) {
    console.error('API /exams/[slug] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
