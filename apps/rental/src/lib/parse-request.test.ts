import { describe, expect, it, vi } from 'vitest';
import { ParseAbortedError, startParseJob, waitForParseJob } from './parse-request';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const noWait = async () => undefined;
const token = async () => 't';

describe('startParseJob', () => {
  it('上傳成功回傳 jobId', async () => {
    const fetchImpl = vi.fn(async () => json({ jobId: 'job-1' }, 202));
    await expect(startParseJob('{}', 't', { fetchImpl, wait: noWait })).resolves.toBe('job-1');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('上傳時連線中斷（Load failed）會自動重試一次', async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('Load failed');
      return json({ jobId: 'job-2' }, 202);
    };
    await expect(startParseJob('{}', 't', { fetchImpl, wait: noWait })).resolves.toBe('job-2');
    expect(calls).toBe(2);
  });

  it('重試還是斷線：換成中文說明，切過背景時提醒等上傳完', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Load failed');
    };
    await expect(startParseJob('{}', 't', { fetchImpl, wait: noWait })).rejects.toThrow('網路連線中斷');
    await expect(startParseJob('{}', 't', { fetchImpl, wait: noWait, wasHidden: () => true })).rejects.toThrow(
      '還沒上傳完',
    );
  });

  it('伺服器回非 JSON 的錯誤（Vercel 413）時依狀態碼說明', async () => {
    const fetchImpl = async () => new Response('Request Entity Too Large', { status: 413 });
    await expect(startParseJob('{}', 't', { fetchImpl, wait: noWait })).rejects.toThrow('截圖太大');
  });
});

describe('waitForParseJob', () => {
  it('等待中就繼續問，完成時回傳結果', async () => {
    const replies = [json({ status: 'pending' }), json({ status: 'done', result: { title: '西屯套房' } })];
    const fetchImpl = vi.fn(async () => replies.shift() as Response);
    await expect(waitForParseJob('job-1', token, { fetchImpl, wait: noWait })).resolves.toMatchObject({
      title: '西屯套房',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('頁面在背景時不發請求，回到畫面才繼續', async () => {
    let visible = false;
    const fetchImpl = vi.fn(async () => json({ status: 'done', result: { title: 'A' } }));
    const wait = async () => {
      visible = true; // 等一輪之後使用者回到畫面
    };
    await waitForParseJob('job-1', token, { fetchImpl, wait, isVisible: () => visible });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('查詢時斷線或伺服器暫時出錯，不算失敗，下一輪再問', async () => {
    const replies: (() => Response)[] = [
      () => {
        throw new TypeError('Load failed');
      },
      () => new Response('<html>500</html>', { status: 500 }),
      () => json({ status: 'done', result: { title: 'B' } }),
    ];
    const fetchImpl = async () => (replies.shift() as () => Response)();
    await expect(waitForParseJob('job-1', token, { fetchImpl, wait: noWait })).resolves.toMatchObject({ title: 'B' });
  });

  it('伺服器回報解析失敗時丟出原因', async () => {
    const fetchImpl = async () => json({ status: 'error', error: 'AI 解析失敗，請再試一次' });
    await expect(waitForParseJob('job-1', token, { fetchImpl, wait: noWait })).rejects.toThrow('AI 解析失敗');
  });

  it('找不到工作（過期或不是自己的）時停止', async () => {
    const fetchImpl = async () => json({ error: '找不到這次解析，請重新上傳' }, 404);
    await expect(waitForParseJob('job-1', token, { fetchImpl, wait: noWait })).rejects.toThrow('找不到這次解析');
  });

  it('等太久就放棄', async () => {
    let t = 0;
    const fetchImpl = async () => json({ status: 'pending' });
    const wait = async () => {
      t += 60_000;
    };
    await expect(
      waitForParseJob('job-1', token, { fetchImpl, wait, now: () => t, startedAt: 0 }),
    ).rejects.toThrow('太久');
  });

  it('隔很久才回來：先問一次，結果好了就直接拿，不會先判定逾時', async () => {
    const fetchImpl = async () => json({ status: 'done', result: { title: 'C' } });
    await expect(
      waitForParseJob('job-1', token, { fetchImpl, wait: noWait, now: () => 10 * 60 * 1000, startedAt: 0 }),
    ).resolves.toMatchObject({ title: 'C' });
  });

  it('離開頁面（abort）時停止等待', async () => {
    const controller = new AbortController();
    const fetchImpl = async () => json({ status: 'pending' });
    const wait = async () => controller.abort();
    await expect(
      waitForParseJob('job-1', token, { fetchImpl, wait, signal: controller.signal }),
    ).rejects.toBeInstanceOf(ParseAbortedError);
  });
});
