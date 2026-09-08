import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage'); // e.g. "Class 10", "Class 12 (PCM)", "Class 12 (PCB)", "Class 12 (Commerce)", "Class 12 (Arts/Humanities)", "UG Engineering (B.Tech)", "Graduation (Any Stream)"
    const q = searchParams.get('q');

    let sql = `
      SELECT
        p.id,
        p.stage_from,
        p.title,
        p.slug,
        p.category,
        p.summary,
        p.flow_stages,
        p.entrance_exams,
        p.counselling_systems,
        p.courses_accessible,
        p.institutions_types,
        p.career_outcomes,
        p.govt_exam_eligibility,
        p.is_verified,
        p.last_verified_at
      FROM student_pathways p
      WHERE p.is_verified = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (stage && stage !== 'all') {
      sql += ` AND p.stage_from ILIKE $${paramIndex++}`;
      params.push(`%${stage}%`);
    }

    if (q) {
      sql += ` AND (p.title ILIKE $${paramIndex} OR p.summary ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY p.id ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (err: any) {
    console.error('API /pathways Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
