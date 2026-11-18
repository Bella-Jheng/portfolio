import { randomUUID } from 'crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../lib/verify-id-token';
import { readingService } from '../../lib/services/reading-service';
import { VIEWED_READING_COOKIE } from '../../lib/cookies';
import { calcJobsRepository } from '../../lib/repositories/calc-jobs-repository';
import { pushSubscriptionsRepository } from '../../lib/repositories/push-subscriptions-repository';
import { notifyUser } from '../../lib/push-notify';
import type { CalculateRequest } from '../../types/bazi';

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

const ADMIN_UID = process.env.ADMIN_UID ?? '';

export async function POST(request: NextRequest) {
  try {
    const createdBy = await extractUid(request);
    // 排盤會呼叫付費的 AI 服務，必須登入才能使用，避免被未登入的請求大量呼叫
    if (!createdBy) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }
    const isAdmin = !!ADMIN_UID && createdBy === ADMIN_UID;
    const body = (await request.json()) as CalculateRequest & { background?: boolean };
    const { name, gender, birthYear, birthMonth, birthDay, birthHour, strengthCalibration } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '請填寫姓名' }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ error: '請選擇性別' }, { status: 400 });
    }
    if (!birthYear || !birthMonth || !birthDay) {
      return NextResponse.json({ error: '請提供完整的出生年月日' }, { status: 400 });
    }

    const params = {
      createdBy,
      isAdmin,
      input: { name, gender, birthYear, birthMonth, birthDay, birthHour, strengthCalibration },
      hasBeenViewed: (readingId: string) => request.cookies.get(VIEWED_READING_COOKIE)?.value === readingId,
    };

    // 舊版前端：等 AI 算完才回應
    if (!body.background) {
      const { id } = await readingService.createOrReuse(params);
      return NextResponse.json({ id }, { headers: { 'Cache-Control': 'no-store, private' } });
    }

    // 背景排盤：沿用既有命盤時直接回 id；要重算就先回 jobId，AI 在回應送出後（after）才跑，
    // 使用者可以切到別的 App，算好用推播通知，回來時用 /api/calculate/jobs/[id] 拿結果
    const plan = await readingService.planCreate(params);
    if (plan.reuseId) {
      return NextResponse.json({ id: plan.reuseId }, { headers: { 'Cache-Control': 'no-store, private' } });
    }

    const jobId = randomUUID();
    await calcJobsRepository.create(jobId, createdBy);
    after(async () => {
      try {
        const readingId = await readingService.generateAndSave({ ...params, overwriteId: plan.overwriteId });
        await calcJobsRepository.complete(jobId, readingId);
        await notifyUser(pushSubscriptionsRepository, createdBy, {
          title: '你的命盤算好了',
          body: `${name.trim()} 的八字命盤已經完成，點開看看`,
          url: `/result/${readingId}`,
          tag: 'bazi-calculate',
        });
      } catch (error) {
        console.error('Background calculate error:', error);
        const aiStatus = (error as { status?: number })?.status;
        const message = aiStatus === 503 || aiStatus === 429 ? 'AI 服務暫時繁忙，請稍後再試' : '命盤計算失敗，請稍後再試';
        await calcJobsRepository.fail(jobId, message).catch((e) => console.error('Mark calc job failed:', e));
        await notifyUser(pushSubscriptionsRepository, createdBy, {
          title: '命盤計算失敗',
          body: '點開再試一次',
          url: '/form',
          tag: 'bazi-calculate',
        });
      }
    });

    return NextResponse.json({ jobId }, { status: 202, headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: '命盤計算失敗，請稍後再試' }, { status: 500 });
  }
}
