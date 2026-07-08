import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../../lib/firebase';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const uid = await extractUid(request);
    if (!uid) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { year, month, day, hour } = body as { year: number; month: number; day: number; hour: number | null };

    await readingService.requestCorrection({ id, uid, year, month, day, hour });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Request correction error:', error);
    return NextResponse.json({ error: '送出失敗，請稍後再試' }, { status: 500 });
  }
}
