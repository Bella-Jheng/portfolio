import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { buildReadingGenerationContext } from '../../../../lib/reading-context';
import { generateDetailedAnalysis, type DetailSection } from '../../../../lib/anthropic';

const VALID_SECTIONS: DetailSection[] = ['wealth', 'career', 'romance', 'health', 'remedy', 'cycleAnalysis', 'tenGodAnalysis'];

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

    const doc = await db.collection('readings').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }
    const data = doc.data();
    if (!data) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const { birthYear, birthMonth, birthDay, birthHour, name, gender, pillars, fortune } = data;

    const { knowledge, currentYear, majorFortuneInfo, strength } = await buildReadingGenerationContext(
      pillars, birthYear, birthMonth, birthDay, gender ?? undefined,
    );

    const detail = await generateDetailedAnalysis({
      name: name ?? undefined,
      gender: gender ?? undefined,
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? undefined,
      pillars,
      knowledge,
      currentYear,
      majorFortuneInfo,
      strength,
      sections: [section],
      existingSummary: fortune,
    });

    const updatedFortune = { ...fortune, ...detail };
    await db.collection('readings').doc(id).update({
      fortune: updatedFortune,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ fortune: updatedFortune });
  } catch (error) {
    console.error('Generate detail error:', error);
    const aiStatus = (error as { status?: number })?.status;
    const isAiOverload = aiStatus === 503 || aiStatus === 429;
    return NextResponse.json(
      { error: isAiOverload ? 'AI 服務暫時繁忙，請稍後再試' : '生成完整分析失敗，請稍後再試' },
      { status: isAiOverload ? 503 : 500 },
    );
  }
}
