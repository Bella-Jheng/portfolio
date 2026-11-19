import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../../lib/verify-id-token';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';

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

// 把命盤分析翻成英文：只翻還沒翻過的欄位，翻完存在 fortuneEn，之後切換語言直接讀，不會再打 AI
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
    const keys = Array.isArray(body?.keys) ? (body.keys as unknown[]).filter((key): key is string => typeof key === 'string') : [];
    if (keys.length === 0) {
      return NextResponse.json({ error: '沒有要翻譯的項目' }, { status: 400 });
    }
    const { fortuneEn } = await readingService.translateFortune({
      id,
      keys,
      userId: uid,
      isAdmin: !!ADMIN_UID && uid === ADMIN_UID,
    });
    return NextResponse.json({ fortuneEn }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Translate fortune error:', error);
    const aiStatus = (error as { status?: number })?.status;
    const isAiOverload = aiStatus === 503 || aiStatus === 429;
    return NextResponse.json(
      { error: isAiOverload ? 'AI 服務暫時繁忙，請稍後再試' : '翻譯失敗，請稍後再試' },
      { status: isAiOverload ? 503 : 500 },
    );
  }
}
