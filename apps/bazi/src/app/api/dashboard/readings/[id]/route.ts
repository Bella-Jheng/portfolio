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
  } catch (error) {
    console.error('[verifyAdmin] failed:', error);
    return false;
  }
}

// PATCH: update birth date and recalculate
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { name, birthYear, birthMonth, birthDay, birthHour } = await request.json();

    const existing = await readingsRepository.getById(id);
    if (!existing) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }
    const { questions } = existing as { questions?: QuestionAnswer[] };

    const { pillars, fortune, updatedAt } = await readingService.regenerateFortune({
      existing,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      name,
      extraFields: { correctionRequested: false },
    });

    const sanitizedQuestions = (questions ?? []).map(({ userId: _uid, ...q }) => q);

    return NextResponse.json({
      ...existing,
      ...(name !== undefined && { name: name ?? null }),
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? null,
      pillars,
      fortune,
      correctionRequested: false,
      questions: sanitizedQuestions,
      updatedAt,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Edit reading error:', error);
    const aiStatusText = (error as { statusText?: string })?.statusText;
    return NextResponse.json(
      { error: '更新失敗，請稍後再試', ...(aiStatusText && { aiStatusText }) },
      { status: 500 },
    );
  }
}

// DELETE: remove a reading
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await readingsRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reading error:', error);
    return NextResponse.json({ error: '刪除失敗，請稍後再試' }, { status: 500 });
  }
}
