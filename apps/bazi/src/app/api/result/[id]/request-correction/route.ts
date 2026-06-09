import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../../../lib/firebase';

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
    const doc = await db.collection('readings').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.correctionUsed) {
      return NextResponse.json({ error: '已使用過更改日期功能，每筆命盤僅限一次' }, { status: 400 });
    }

    const body = await request.json();
    const { year, month, day, hour } = body as { year: number; month: number; day: number; hour: number | null };

    await db.collection('readings').doc(id).update({
      correctionRequested: true,
      correctionRequestedAt: new Date().toISOString(),
      correctionRequestedBy: uid,
      correctionUsed: true,
      correctionRequestedDate: { year, month, day, hour: hour ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Request correction error:', error);
    return NextResponse.json({ error: '送出失敗，請稍後再試' }, { status: 500 });
  }
}
