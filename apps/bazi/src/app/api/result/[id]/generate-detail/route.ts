import { NextRequest, NextResponse } from 'next/server';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';
import type { DetailSection } from '../../../../lib/anthropic';

const VALID_SECTIONS: DetailSection[] = ['wealth', 'career', 'romance', 'health', 'remedy', 'cycleAnalysis', 'monthlyFortune', 'tenGodAnalysis'];

// 暫時的測試端點：目前沒有身份驗證/解鎖配額檢查，正式上線前要補上
// （只有訂閱/已解鎖的使用者才能觸發這個 API，且要有防止重複扣款/重複生成的邏輯）。
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
