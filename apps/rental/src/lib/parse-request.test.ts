import { describe, expect, it, vi } from 'vitest';
import { postParse } from './parse-request';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const noWait = async () => undefined;

describe('postParse', () => {
  it('成功時回傳解析結果', async () => {
    const fetchImpl = vi.fn(async () => ok({ title: 'A' }));
    await expect(postParse('{}', 't', { fetchImpl, wait: noWait })).resolves.toMatchObject({ title: 'A' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('連線中斷（Load failed）會自動重試一次', async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('Load failed');
      return ok({ title: 'B' });
    };
    await expect(postParse('{}', 't', { fetchImpl, wait: noWait })).resolves.toMatchObject({ title: 'B' });
    expect(calls).toBe(2);
  });

  it('重試還是斷線：換成看得懂的訊息，切過背景時提醒停在畫面上', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Load failed');
    };
    await expect(postParse('{}', 't', { fetchImpl, wait: noWait })).rejects.toThrow('網路連線中斷');
    await expect(postParse('{}', 't', { fetchImpl, wait: noWait, wasHidden: () => true })).rejects.toThrow(
      '解析時離開了這個畫面',
    );
  });

  it('伺服器回非 JSON 的錯誤（Vercel 413／504）時依狀態碼說明', async () => {
    const r413 = async () => new Response('Request Entity Too Large', { status: 413 });
    await expect(postParse('{}', 't', { fetchImpl: r413, wait: noWait })).rejects.toThrow('截圖太大');
    const r504 = async () => new Response('<html>timeout</html>', { status: 504 });
    await expect(postParse('{}', 't', { fetchImpl: r504, wait: noWait })).rejects.toThrow('逾時');
  });

  it('伺服器有回錯誤訊息就直接顯示，而且不重試', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: 'AI 解析失敗，請再試一次' }), { status: 502 }));
    await expect(postParse('{}', 't', { fetchImpl, wait: noWait })).rejects.toThrow('AI 解析失敗，請再試一次');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
