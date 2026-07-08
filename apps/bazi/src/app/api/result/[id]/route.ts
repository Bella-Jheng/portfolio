import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase';
import { readingsRepository } from '../../../lib/repositories/readings-repository';
import { readingService, ServiceError } from '../../../lib/services/reading-service';
import { VIEWED_READING_COOKIE } from '../../../lib/cookies';
import type { AskQuestionRequest } from '../../../types/bazi';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

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

function resolveTimezone(header: string | null): string {
  const fallback = 'Asia/Taipei';
  if (!header) return fallback;
  try {
    Intl.DateTimeFormat('sv-SE', { timeZone: header });
    return header;
  } catch {
    return fallback;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docData = await readingsRepository.getById(id);
    if (!docData) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const { id: readingId, createdBy, adminQuestions: rawAdminQs, ...data } = docData;
    const sanitizedQuestions = ((data.questions ?? []) as { userId?: string; [k: string]: unknown }[]).map(
      ({ userId: _uid, ...q }) => q,
    );

    const userId = await extractUid(request);
    const isAdmin = !!userId && userId === ADMIN_UID;
    const tz = resolveTimezone(request.headers.get('X-Timezone'));
    const remainingToday = userId && !isAdmin
      ? Math.max(0, 3 - (await readingsRepository.countTodayQuestionsForUser(userId, tz)))
      : null;

    const adminQuestions = isAdmin
      ? ((rawAdminQs ?? []) as { userId?: string; [k: string]: unknown }[]).map(({ userId: _uid, ...q }) => q)
      : undefined;

    const response = NextResponse.json(
      { id: readingId, ...data, questions: sanitizedQuestions, ...(adminQuestions !== undefined && { adminQuestions }), remainingToday },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );

    // 本人看過結果後才鎖定「一人一次」限制；session cookie 隨瀏覽器關閉失效，不需另外查資料庫欄位
    if (userId && !isAdmin && userId === createdBy) {
      response.cookies.set(VIEWED_READING_COOKIE, readingId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Get result error:', error);
    return NextResponse.json({ error: '讀取命盤失敗' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await extractUid(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登入才能提問' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as AskQuestionRequest;
    const { question, adminQuestion } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: '請輸入問題' }, { status: 400 });
    }

    const isAdmin = userId === ADMIN_UID;
    const tz = resolveTimezone(request.headers.get('X-Timezone'));

    const result = await readingService.askQuestion({ id, question, userId, isAdmin, adminQuestion, tz });

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, ...error.payload }, { status: error.status });
    }
    console.error('Ask question error:', error);
    const aiStatusText = (error as { statusText?: string })?.statusText;
    return NextResponse.json(
      { error: '提問失敗，請稍後再試', ...(aiStatusText && { aiStatusText }) },
      { status: 500 },
    );
  }
}
