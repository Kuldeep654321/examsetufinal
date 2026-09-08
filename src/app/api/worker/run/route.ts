import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { IngestionPipeline } from '@/lib/workers/pipeline';

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['admin']);
    if (authRes instanceof NextResponse) return authRes;

    const syncResult = await IngestionPipeline.runFullSync();

    return NextResponse.json({
      success: true,
      message: 'Source monitoring and ingestion pipeline executed successfully.',
      result: syncResult,
    });
  } catch (err: any) {
    console.error('API /worker/run Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
