import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../../lib/firebase';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';
import type { DetailSection } from '../../../../lib/anthropic';

const VALID_SECTIONS: DetailSection[] = ['wealth', 'career', 'romance', 'health', 'remedy', 'cycleAnalysis', 'monthlyFortune', 'tenGodAnalysis'];

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

// 這支會實際呼叫付費的 AI 服務並覆寫命盤內容，之前完全沒驗證身份，任何人不登入就能打。
// 目前先擋成「要登入才能用」，跟同層的 askQuestion 一致；日後若要做訂閱/解鎖配額，在這裡加。
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
    const section = body?.section as DetailSection;
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: '無效的項目' }, { status: 400 });
    }

    const { fortune } = await readingService.generateDetail({ id, section });

    return NextResponse.json({ fortune });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Generate detail error:', error);
    const aiStatus = (error as { status?: number })?.status;
    const isAiOverload = aiStatus === 503 || aiStatus === 429;
    return NextResponse.json(
      { error: isAiOverload ? 'AI 服務暫時繁忙，請稍後再試' : '生成完整分析失敗，請稍後再試' },
      { status: isAiOverload ? 503 : 500 },
    );
  }
}
