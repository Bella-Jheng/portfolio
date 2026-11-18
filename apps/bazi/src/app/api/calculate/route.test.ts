import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// after() 只能在真正的請求裡用；測試時先收起來，手動執行
const afterTasks: (() => Promise<void>)[] = [];
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: (task: () => Promise<void>) => afterTasks.push(task),
}));

vi.mock('../../lib/verify-id-token', () => ({ verifyIdToken: async () => ({ uid: 'user-1' }) }));

const jobs = new Map<string, { createdBy: string; status: string; readingId?: string; error?: string; createdAt: string }>();
vi.mock('../../lib/repositories/calc-jobs-repository', () => ({
  calcJobsRepository: {
    create: async (id: string, createdBy: string) =>
      void jobs.set(id, { createdBy, status: 'pending', createdAt: new Date().toISOString() }),
    get: async (id: string, createdBy: string) => {
      const job = jobs.get(id);
      return job && job.createdBy === createdBy ? { id, ...job } : null;
    },
    complete: async (id: string, readingId: string) => void Object.assign(jobs.get(id) ?? {}, { status: 'done', readingId }),
    fail: async (id: string, error: string) => void Object.assign(jobs.get(id) ?? {}, { status: 'error', error }),
  },
}));
vi.mock('../../lib/repositories/push-subscriptions-repository', () => ({
  pushSubscriptionsRepository: { list: async () => [], remove: async () => undefined },
}));

// 用一般物件控制服務層的結果（vi.fn 回傳被拒絕的 promise 會被 vitest 算成錯誤）
const service = {
  plan: { reuseId: null as string | null, overwriteId: null as string | null },
  generate: async (): Promise<string> => 'reading-new',
  createOrReuseCalls: 0,
};
vi.mock('../../lib/services/reading-service', () => ({
  readingService: {
    planCreate: async () => service.plan,
    generateAndSave: () => service.generate(),
    createOrReuse: async () => {
      service.createOrReuseCalls += 1;
      return { id: 'reading-sync', reused: false };
    },
  },
}));

const { POST } = await import('./route');
const { GET } = await import('./jobs/[id]/route');

const form = { name: '小明', gender: 'male', birthYear: 1996, birthMonth: 3, birthDay: 8, birthHour: 10 };
const post = (extra: Record<string, unknown> = {}) =>
  POST(
    new NextRequest('https://bazi.example.com/api/calculate', {
      method: 'POST',
      headers: { Authorization: 'Bearer t' },
      body: JSON.stringify({ ...form, ...extra }),
    }),
  );
const get = (id: string) =>
  GET(new NextRequest(`https://bazi.example.com/api/calculate/jobs/${id}`, { headers: { Authorization: 'Bearer t' } }), {
    params: Promise.resolve({ id }),
  });

describe('背景排盤 /api/calculate', () => {
  beforeEach(() => {
    afterTasks.length = 0;
    jobs.clear();
    service.plan = { reuseId: null, overwriteId: null };
    service.generate = async () => 'reading-new';
    service.createOrReuseCalls = 0;
  });

  it('舊版前端（沒帶 background）照舊等算完才回 id', async () => {
    const res = await post();
    expect(await res.json()).toEqual({ id: 'reading-sync' });
    expect(service.createOrReuseCalls).toBe(1);
    expect(afterTasks).toHaveLength(0);
  });

  it('沿用既有命盤時直接回 id，不排背景工作', async () => {
    service.plan = { reuseId: 'reading-old', overwriteId: null };
    const res = await post({ background: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'reading-old' });
    expect(afterTasks).toHaveLength(0);
  });

  it('要重算時先回 jobId，AI 在回應之後才跑，算好查得到命盤 id', async () => {
    const res = await post({ background: true });
    expect(res.status).toBe(202);
    const { jobId } = await res.json();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'pending' });

    await afterTasks[0]();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'done', readingId: 'reading-new' });
  });

  it('AI 繁忙時存成失敗並附上原因', async () => {
    service.generate = async () => Promise.reject(Object.assign(new Error('overloaded'), { status: 503 }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { jobId } = await (await post({ background: true })).json();
    await afterTasks[0]();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'error', error: 'AI 服務暫時繁忙，請稍後再試' });
  });

  it('只查得到自己的工作', async () => {
    const { jobId } = await (await post({ background: true })).json();
    const job = jobs.get(jobId);
    if (job) job.createdBy = 'someone-else';
    expect((await get(jobId)).status).toBe(404);
  });
});
