import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';

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
      class_level: '12',
      board: 'CBSE',
      state: 'Madhya Pradesh',
      stream: 'PCB',
      target_exams: ['NEET UG', 'CUET UG'],
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

    // 4. Fetch Recommended Opportunities matching stream/qualification
    const userStream = profile.stream || 'PCB';
    const oppsRes = await query(
      `SELECT
        opp.id,
        opp.slug,
        opp.title,
        opp.opp_type,
        opp.qualification,
        opp.benefits,
        opp.financial_aid_amount,
        opp.application_deadline,
        opp.is_deadline_extended,
        opp.status,
        opp.official_source_url,
        o.name as org_name,
        o.short_name as org_short_name
      FROM opportunities opp
      JOIN organizations o ON opp.org_id = o.id
      WHERE opp.status IN ('open', 'closing_soon', 'announced')
      ORDER BY opp.is_featured DESC, opp.application_deadline ASC NULLS LAST
      LIMIT 6`
    );

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
        recommendations: oppsRes.rows,
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
