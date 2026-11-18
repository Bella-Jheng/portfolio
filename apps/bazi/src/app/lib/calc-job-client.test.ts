import { describe, expect, it, vi } from 'vitest';
import { CalcJobAbortedError, waitForCalcJob } from './calc-job-client';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const noWait = async () => undefined;
const token = async () => 't';

describe('waitForCalcJob', () => {
  it('還在算就繼續問，算好回傳命盤 id', async () => {
    const replies = [json({ status: 'pending' }), json({ status: 'done', readingId: 'reading-1' })];
    const fetchImpl = vi.fn(async () => replies.shift() as Response);
    await expect(waitForCalcJob('job', token, { fetchImpl, wait: noWait })).resolves.toBe('reading-1');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('頁面在背景時不發請求，回到畫面才問', async () => {
    let visible = false;
    const fetchImpl = vi.fn(async () => json({ status: 'done', readingId: 'r' }));
    await waitForCalcJob('job', token, { fetchImpl, wait: async () => void (visible = true), isVisible: () => visible });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('斷線（Load failed）或伺服器暫時出錯時下一輪再問', async () => {
    const replies: (() => Response)[] = [
      () => {
        throw new TypeError('Load failed');
      },
      () => new Response('<html>500</html>', { status: 500 }),
      () => json({ status: 'done', readingId: 'r2' }),
    ];
    const fetchImpl = async () => (replies.shift() as () => Response)();
    await expect(waitForCalcJob('job', token, { fetchImpl, wait: noWait })).resolves.toBe('r2');
  });

  it('伺服器回報失敗時丟出原因', async () => {
    const fetchImpl = async () => json({ status: 'error', error: 'AI 服務暫時繁忙，請稍後再試' });
    await expect(waitForCalcJob('job', token, { fetchImpl, wait: noWait })).rejects.toThrow('AI 服務暫時繁忙');
  });

  it('找不到工作時停止', async () => {
    const fetchImpl = async () => json({ error: '找不到這次排盤，請重新送出' }, 404);
    await expect(waitForCalcJob('job', token, { fetchImpl, wait: noWait })).rejects.toThrow('找不到這次排盤');
  });

  it('離開頁面（abort）時停止等待', async () => {
    const controller = new AbortController();
    const fetchImpl = async () => json({ status: 'pending' });
    await expect(
      waitForCalcJob('job', token, { fetchImpl, wait: async () => controller.abort(), signal: controller.signal }),
    ).rejects.toBeInstanceOf(CalcJobAbortedError);
  });
});
