import { beforeEach, describe, expect, it } from 'vitest';
import { generateVAPIDKeys, WebPushError } from 'web-push';
import { notifyUser, sendToSubscriptions } from './push-notify';

const subs = [
  { endpoint: 'https://push.example.com/ok', p256dh: 'k1', auth: 'a1' },
  { endpoint: 'https://push.example.com/gone', p256dh: 'k2', auth: 'a2' },
];

describe('notifyUser', () => {
  const removed: string[] = [];
  const store = {
    list: async () => subs,
    remove: async (endpoint: string) => void removed.push(endpoint),
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
    await notifyUser(store, 'me', { title: '你的命盤算好了', body: '點開看看', url: '/result/r1' }, async (sub, data) => {
      sent.push({ endpoint: sub.endpoint, data: String(data) });
      return { statusCode: 201, body: '', headers: {} };
    });
    expect(sent.map((s) => s.endpoint)).toEqual(subs.map((s) => s.endpoint));
    expect(JSON.parse(sent[0].data)).toEqual({ title: '你的命盤算好了', body: '點開看看', url: '/result/r1' });
  });

  it('推播服務回報失效（410）的訂閱會被刪掉，其他錯誤不影響', async () => {
    await notifyUser(store, 'me', { title: 't', body: 'b', url: '/' }, async (sub) => {
      if (sub.endpoint.endsWith('gone')) throw new WebPushError('Gone', 410, {}, '', sub.endpoint);
      return { statusCode: 201, body: '', headers: {} };
    });
    expect(removed).toEqual(['https://push.example.com/gone']);
  });
});

describe('sendToSubscriptions', () => {
  beforeEach(() => {
    const keys = generateVAPIDKeys();
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  });

  it('依每台裝置決定內容，回傳 null 的跳過；失效的訂閱會被刪掉', async () => {
    const removed: string[] = [];
    const devices = [
      { endpoint: 'https://push.example.com/zh', p256dh: 'k1', auth: 'a1', locale: 'zh' },
      { endpoint: 'https://push.example.com/en', p256dh: 'k2', auth: 'a2', locale: 'en' },
      { endpoint: 'https://push.example.com/skip', p256dh: 'k3', auth: 'a3', locale: 'zh' },
      { endpoint: 'https://push.example.com/gone', p256dh: 'k4', auth: 'a4', locale: 'zh' },
    ];
    const sent: { endpoint: string; title: string }[] = [];
    const count = await sendToSubscriptions(
      { remove: async (endpoint: string) => void removed.push(endpoint) },
      devices,
      (d) => (d.endpoint.endsWith('skip') ? null : { title: d.locale === 'en' ? 'Hi' : '嗨', body: '', url: '/' }),
      async (sub, data) => {
        if (sub.endpoint.endsWith('gone')) throw new WebPushError('Gone', 410, {}, '', sub.endpoint);
        sent.push({ endpoint: sub.endpoint, title: JSON.parse(String(data)).title });
        return { statusCode: 201, body: '', headers: {} };
      },
    );
    expect(count).toBe(2);
    expect(sent).toEqual([
      { endpoint: 'https://push.example.com/zh', title: '嗨' },
      { endpoint: 'https://push.example.com/en', title: 'Hi' },
    ]);
    expect(removed).toEqual(['https://push.example.com/gone']);
  });
});
