import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { filterExamsForProfile, filterOpportunitiesForProfile } from '@/lib/recommendation-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch User Profile
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileRes.rows[0] || {
      class_level: 'BTech_Final',
      board: 'Autonomous University / AICTE',
      state: 'Madhya Pradesh',
      stream: 'Engineering',
      target_exams: ['GATE', 'CAT', 'SSC CGL', 'UPSC CSE', 'ISRO'],
    };

    // 2. Fetch Today's / Recent Verified Updates
    const updatesRes = await query(`
      SELECT
        up.id,
        up.title,
        up.summary,
        up.old_value,
        up.new_value,
        up.update_type,
        up.official_source_url,
        up.is_breaking,
        up.published_at,
        e.slug as exam_slug,
        e.title as exam_title,
        o.short_name as org_short_name
      FROM exam_updates up
      JOIN exams e ON up.exam_id = e.id
      JOIN organizations o ON e.conducting_org_id = o.id
      ORDER BY up.published_at DESC
      LIMIT 6
    `);

    // 3. Fetch Prioritized Upcoming Deadlines (within next 60 days)
    const deadlinesRes = await query(`
      SELECT
        ev.id as event_id,
        ev.title as event_title,
        ev.event_type,
        ev.end_date,
        ev.start_date,
        ev.is_extended,
        ev.status,
        ev.official_source_url,
        e.id as exam_id,
        e.title as exam_title,
        e.slug as exam_slug,
        e.level,
        o.short_name as org_short_name
      FROM exam_events ev
      JOIN exams e ON ev.exam_id = e.id
      JOIN organizations o ON e.conducting_org_id = o.id
      WHERE ev.end_date >= CURRENT_DATE
      ORDER BY ev.end_date ASC
      LIMIT 8
    `);

    // 4. Fetch All Active Exams & Opportunities for Intelligent Profile Matching
    const allExamsRes = await query(`
      SELECT
        e.id, e.slug, e.title, e.short_title, e.conducting_org_id, e.category_id,
        e.level, e.stream_eligibility, e.min_age, e.max_age, e.eligibility_criteria,
        e.exam_frequency, e.official_website_url, e.registration_url, e.syllabus_url,
        e.exam_pattern, e.important_documents, e.faqs, e.is_featured, e.is_active,
        e.last_verified_at, o.name as org_name, o.short_name as org_short_name, o.official_domain
      FROM exams e
      JOIN organizations o ON e.conducting_org_id = o.id
      WHERE e.is_active = true
      ORDER BY e.is_featured DESC, e.title ASC
    `);

    const allOppsRes = await query(`
      SELECT
        opp.id, opp.slug, opp.title, opp.opp_type, opp.qualification, opp.eligibility,
        opp.benefits, opp.financial_aid_amount, opp.application_deadline, opp.is_deadline_extended,
        opp.status, opp.official_source_url, opp.official_portal_link,
        o.name as org_name, o.short_name as org_short_name
      FROM opportunities opp
      JOIN organizations o ON opp.org_id = o.id
      WHERE opp.status IN ('open', 'closing_soon', 'announced', 'upcoming')
      ORDER BY opp.is_featured DESC, opp.application_deadline ASC NULLS LAST
    `);

    const profileContext = {
      classLevel: profile.class_level || 'BTech_Final',
      stream: profile.stream || 'Engineering',
      targetCategory: profile.target_category || 'All',
    };

    const recommendedExams = filterExamsForProfile(allExamsRes.rows, profileContext);
    const recommendedOpps = filterOpportunitiesForProfile(allOppsRes.rows, profileContext);

    // 5. Fetch Student's Application Tracker Items
    const trackerRes = await query(
      `SELECT
        t.id,
        t.target_type,
        t.target_id,
        t.status,
        t.application_number,
        t.roll_number,
        t.exam_date,
        t.exam_center,
        t.private_notes,
        t.documents_checklist,
        t.created_at,
        t.updated_at,
        CASE
          WHEN t.target_type = 'exam' THEN (SELECT title FROM exams WHERE id = t.target_id)
          ELSE (SELECT title FROM opportunities WHERE id = t.target_id)
        END as target_title,
        CASE
          WHEN t.target_type = 'exam' THEN (SELECT slug FROM exams WHERE id = t.target_id)
          ELSE (SELECT slug FROM opportunities WHERE id = t.target_id)
        END as target_slug
      FROM application_tracker t
      WHERE t.user_id = $1
      ORDER BY t.updated_at DESC`,
      [user.id]
    );

    // 6. Fetch Saved Bookmarks
    const savedExamsRes = await query(
      `SELECT se.id, se.notes, se.created_at, e.id as exam_id, e.title, e.slug, e.short_title, e.level, o.short_name as org_name
       FROM saved_exams se
       JOIN exams e ON se.exam_id = e.id
       JOIN organizations o ON e.conducting_org_id = o.id
       WHERE se.user_id = $1`,
      [user.id]
    );

    const savedOppsRes = await query(
      `SELECT so.id, so.notes, so.created_at, opp.id as opp_id, opp.title, opp.slug, opp.opp_type, opp.financial_aid_amount, opp.application_deadline
       FROM saved_opportunities so
       JOIN opportunities opp ON so.opportunity_id = opp.id
       WHERE so.user_id = $1`,
      [user.id]
    );

    // 7. Unread Notifications Count
    const notifCountRes = await query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        profile,
        updates: updatesRes.rows,
        deadlines: deadlinesRes.rows,
        recommendedExams,
        recommendations: recommendedOpps,
        tracker: trackerRes.rows,
        savedExams: savedExamsRes.rows,
        savedOpportunities: savedOppsRes.rows,
        unreadNotificationsCount: parseInt(notifCountRes.rows[0].unread_count || '0', 10),
      },
    });
  } catch (err: any) {
    console.error('API /dashboard Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
