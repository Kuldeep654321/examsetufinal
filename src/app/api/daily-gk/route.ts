import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let sql = `SELECT * FROM daily_gk_capsules WHERE 1=1`;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ` AND category ILIKE $1`;
      params.push(`%${category}%`);
    }

    sql += ` ORDER BY published_date DESC, created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('API /daily-gk Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
