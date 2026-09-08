import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type, id, notes } = await req.json();

    if (type === 'exam') {
      await query(
        `INSERT INTO saved_exams (user_id, exam_id, notes)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, exam_id) DO NOTHING`,
        [user.id, id, notes || null]
      );
    } else if (type === 'opportunity') {
      await query(
        `INSERT INTO saved_opportunities (user_id, opportunity_id, notes)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, opportunity_id) DO NOTHING`,
        [user.id, id, notes || null]
      );
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (type === 'exam') {
      await query('DELETE FROM saved_exams WHERE user_id = $1 AND exam_id = $2', [user.id, id]);
    } else if (type === 'opportunity') {
      await query('DELETE FROM saved_opportunities WHERE user_id = $1 AND opportunity_id = $2', [user.id, id]);
    }

    return NextResponse.json({ success: true, message: 'Removed from bookmarks' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
