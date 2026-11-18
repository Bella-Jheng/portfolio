import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../../lib/verify-id-token';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';
import { isLocale } from '../../../../lib/i18n/locale';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// 翻譯一則 AI 追問（使用者切換語言後按「翻譯」）；不扣每日提問額度
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
    const body = await request.json().catch(() => null);
    const index = Number(body?.index);
    const target = body?.target;
    if (!Number.isInteger(index) || index < 0 || !isLocale(target)) {
      return NextResponse.json({ error: '參數錯誤' }, { status: 400 });
    }
    const { questions } = await readingService.translateQuestion({
      id,
      index,
      target,
      userId: uid,
      isAdmin: !!ADMIN_UID && uid === ADMIN_UID,
    });
    return NextResponse.json({ questions }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Translate question error:', error);
    const aiStatus = (error as { status?: number })?.status;
    const isAiOverload = aiStatus === 503 || aiStatus === 429;
    return NextResponse.json(
      { error: isAiOverload ? 'AI 服務暫時繁忙，請稍後再試' : '翻譯失敗，請稍後再試' },
      { status: isAiOverload ? 503 : 500 },
    );
  }
}
