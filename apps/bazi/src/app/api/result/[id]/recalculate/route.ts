import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../../lib/firebase';
import { readingsRepository } from '../../../../lib/repositories/readings-repository';
import { readingService, ServiceError } from '../../../../lib/services/reading-service';
import type { QuestionAnswer } from '../../../../types/bazi';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !ADMIN_UID) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid === ADMIN_UID;
  } catch {
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await readingsRepository.getById(id);
    if (!existing) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const { birthYear, birthMonth, birthDay, birthHour, questions } = existing as unknown as {
      birthYear: number; birthMonth: number; birthDay: number; birthHour?: number | null; questions?: QuestionAnswer[];
    };

    const { pillars, fortune } = await readingService.regenerateFortune({
      existing,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
    });

    const sanitizedQuestions = (questions ?? []).map(({ userId: _uid, ...q }) => q);

    return NextResponse.json({ pillars, fortune, questions: sanitizedQuestions });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Recalculate error:', error);
    const aiStatus = (error as { status?: number })?.status;
    const aiStatusText = (error as { statusText?: string })?.statusText;
    const isAiOverload = aiStatus === 503 || aiStatus === 429;
    return NextResponse.json(
      {
        error: isAiOverload ? 'AI 服務暫時繁忙，請稍後再試' : '重新計算失敗，請稍後再試',
        ...(aiStatusText && { aiStatusText }),
      },
      { status: isAiOverload ? 503 : 500 },
    );
  }
}
