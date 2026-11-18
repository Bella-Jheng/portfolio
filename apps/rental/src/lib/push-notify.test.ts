import { beforeEach, describe, expect, it } from 'vitest';
import { generateVAPIDKeys, WebPushError } from 'web-push';
import { notifyUser } from './push-notify';

const subs = [
  { endpoint: 'https://push.example.com/ok', p256dh: 'k1', auth: 'a1' },
  { endpoint: 'https://push.example.com/gone', p256dh: 'k2', auth: 'a2' },
];

describe('notifyUser', () => {
  const removed: string[] = [];
  const repos = {
    pushSubscriptions: {
      save: async () => undefined,
      list: async () => subs,
      remove: async (endpoint: string) => void removed.push(endpoint),
    },
  };

  beforeEach(() => {
    removed.length = 0;
    // 測試時臨時產生的 VAPID 金鑰（只用來通過格式檢查，不會真的送出）
    const keys = generateVAPIDKeys();
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  });

  it('推給每一台裝置，帶上標題和要打開的頁面', async () => {
    const sent: { endpoint: string; data: string }[] = [];
    await notifyUser(repos, 'me', { title: '截圖解析好了', body: '點開確認', url: '/add' }, async (sub, data) => {
      sent.push({ endpoint: sub.endpoint, data: String(data) });
      return { statusCode: 201, body: '', headers: {} };
    });
    expect(sent.map((s) => s.endpoint)).toEqual(subs.map((s) => s.endpoint));
    expect(JSON.parse(sent[0].data)).toEqual({ title: '截圖解析好了', body: '點開確認', url: '/add' });
  });

  it('推播服務回報失效（410）的訂閱會被刪掉，其他錯誤不影響', async () => {
    await notifyUser(repos, 'me', { title: 't', body: 'b', url: '/' }, async (sub) => {
      if (sub.endpoint.endsWith('gone')) throw new WebPushError('Gone', 410, {}, '', sub.endpoint);
      return { statusCode: 201, body: '', headers: {} };
    });
    expect(removed).toEqual(['https://push.example.com/gone']);
  });
});
