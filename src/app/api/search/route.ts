import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const type = searchParams.get('type'); // 'all' | 'exam' | 'opportunity'

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, exams: [], opportunities: [], categories: [] });
    }

    const searchQuery = `%${q}%`;

    // 1. Search Exams (Trigram similarity + ILIKE + FTS)
    let exams: any[] = [];
    if (!type || type === 'all' || type === 'exam') {
      const examRes = await query(
        `SELECT
          e.id,
          e.title,
          e.short_title,
          e.slug,
          e.level,
          e.stream_eligibility,
          e.last_verified_at,
          o.short_name as org_name,
          c.name as category_name,
          similarity(e.title, $1) as match_score
        FROM exams e
        JOIN organizations o ON e.conducting_org_id = o.id
        JOIN categories c ON e.category_id = c.id
        WHERE
          e.title ILIKE $2 OR
          e.short_title ILIKE $2 OR
          o.name ILIKE $2 OR
          o.short_name ILIKE $2 OR
          similarity(e.title, $1) > 0.2
        ORDER BY match_score DESC, e.is_featured DESC
        LIMIT 8`,
        [q, searchQuery]
      );
      exams = examRes.rows;
    }

    // 2. Search Opportunities
    let opportunities: any[] = [];
    if (!type || type === 'all' || type === 'opportunity') {
      const oppRes = await query(
        `SELECT
          opp.id,
          opp.title,
          opp.slug,
          opp.opp_type,
          opp.qualification,
          opp.financial_aid_amount,
          opp.application_deadline,
          opp.status,
          o.short_name as org_name,
          similarity(opp.title, $1) as match_score
        FROM opportunities opp
        JOIN organizations o ON opp.org_id = o.id
        WHERE
          opp.title ILIKE $2 OR
          opp.description ILIKE $2 OR
          opp.qualification ILIKE $2 OR
          similarity(opp.title, $1) > 0.2
        ORDER BY match_score DESC, opp.is_featured DESC
        LIMIT 6`,
        [q, searchQuery]
      );
      opportunities = oppRes.rows;
    }

    // 3. Search Categories
    const catRes = await query(
      `SELECT id, name, slug, icon FROM categories
       WHERE name ILIKE $1 LIMIT 4`,
      [searchQuery]
    );

    return NextResponse.json({
      success: true,
      query: q,
      totalMatches: exams.length + opportunities.length + catRes.rows.length,
      exams,
      opportunities,
      categories: catRes.rows,
    });
  } catch (err: any) {
    console.error('API /search Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
