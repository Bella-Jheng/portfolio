import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { ParseJob } from '../../../lib/data/types';

// after() 只能在真正的請求裡用；測試時先收起來，手動執行
const afterTasks: (() => Promise<void>)[] = [];
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: (task: () => Promise<void>) => afterTasks.push(task),
}));

const jobs = new Map<string, ParseJob & { ownerUid: string }>();
const repos = {
  parseJobs: {
    create: async (ownerUid: string, id: string) =>
      void jobs.set(id, { id, ownerUid, status: 'pending', createdAt: new Date().toISOString() }),
    get: async (ownerUid: string, id: string) => {
      const job = jobs.get(id);
      return job && job.ownerUid === ownerUid ? job : null;
    },
    complete: async (_: string, id: string, result: ParseJob['result']) =>
      void jobs.set(id, { ...(jobs.get(id) as ParseJob & { ownerUid: string }), status: 'done', result }),
    fail: async (_: string, id: string, error: string) =>
      void jobs.set(id, { ...(jobs.get(id) as ParseJob & { ownerUid: string }), status: 'error', error }),
  },
};
let uid = 'me';
vi.mock('../../../lib/verify-user', () => ({
  verifyUser: async () => ({ ok: true, uid, email: 'me@example.com', repos }),
}));

// 用一般函式控制 AI 的結果（vi.fn 回傳被拒絕的 promise 會被 vitest 算成錯誤）
const parser: { impl: () => Promise<unknown> } = { impl: async () => ({ title: '西屯套房' }) };
vi.mock('../../../lib/listing-parser', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/listing-parser')>()),
  parseListingImages: () => parser.impl(),
}));

const { POST } = await import('./route');
const { GET } = await import('./[id]/route');

const image = { mimeType: 'image/jpeg', data: 'AAAA' };
const post = (images: unknown[] = [image]) =>
  POST(
    new NextRequest('https://rent.example.com/api/parse-jobs', {
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: JSON.stringify({ images }),
    }),
  );
const get = (id: string) =>
  GET(new NextRequest(`https://rent.example.com/api/parse-jobs/${id}`, { headers: { authorization: 'Bearer t' } }), {
    params: Promise.resolve({ id }),
  });

describe('背景解析 /api/parse-jobs', () => {
  beforeEach(() => {
    process.env.GOOGLE_AI_API_KEY = 'test-key';
    afterTasks.length = 0;
    jobs.clear();
    uid = 'me';
    parser.impl = async () => ({ title: '西屯套房' });
  });

  it('上傳後馬上回 jobId，AI 在回應之後才跑，跑完存成 done', async () => {
    const res = await post();
    expect(res.status).toBe(202);
    const { jobId } = await res.json();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'pending' });

    await afterTasks[0]();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'done', result: { title: '西屯套房' } });
  });

  it('AI 失敗時存成 error，查詢會拿到原因', async () => {
    parser.impl = async () => Promise.reject(new Error('quota'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { jobId } = await (await post()).json();
    await afterTasks[0]();
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'error', error: 'AI 解析失敗，請再試一次' });
  });

  it('截圖數量不對時直接拒絕，不建立工作', async () => {
    expect((await post([])).status).toBe(400);
    expect(jobs.size).toBe(0);
  });

  it('只查得到自己的工作', async () => {
    const { jobId } = await (await post()).json();
    uid = 'someone-else';
    expect((await get(jobId)).status).toBe(404);
  });

  it('等待中太久（背景被中止）時回報失敗', async () => {
    const { jobId } = await (await post()).json();
    const job = jobs.get(jobId) as ParseJob & { ownerUid: string };
    jobs.set(jobId, { ...job, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() });
    expect(await (await get(jobId)).json()).toMatchObject({ status: 'error' });
  });
});
