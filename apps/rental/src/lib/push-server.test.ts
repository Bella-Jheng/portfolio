import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'https';
import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createECDH, randomBytes } from 'crypto';
import webpush from 'web-push';
import type { NotificationRepository, PushSubscriptionRecord } from './data/types';

// 在本機架一個假的推播服務（HTTPS，web-push 只走 HTTPS）：記下收到的請求，/gone 路徑模擬「裝置已取消訂閱」
let server: Server;
let base = '';
const received: { path: string; headers: Record<string, unknown>; bytes: number }[] = [];

beforeAll(async () => {
  const keys = webpush.generateVAPIDKeys();
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = keys.publicKey;
  process.env.VAPID_PRIVATE_KEY = keys.privateKey;
  process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  // 自簽憑證：只在這個測試裡用，並暫時允許自簽憑證
  const dir = mkdtempSync(join(tmpdir(), 'push-test-'));
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=127.0.0.1', '-days', '1',
    '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem'),
  ], { stdio: 'ignore' });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  server = createServer({ key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')) }, (req, res) => {
    let bytes = 0;
    req.on('data', (c: Buffer) => (bytes += c.length));
    req.on('end', () => {
      received.push({ path: req.url ?? '', headers: req.headers, bytes });
      res.statusCode = req.url === '/gone' ? 410 : 201;
      res.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  base = `https://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

afterAll(async () => {
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// 瀏覽器訂閱時會給的金鑰：P-256 公鑰與 16 bytes 的 auth
function fakeSubscription(path: string): PushSubscriptionRecord {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  return {
    endpoint: `${base}${path}`,
    keys: { p256dh: ecdh.getPublicKey().toString('base64url'), auth: randomBytes(16).toString('base64url') },
  };
}

describe('sendToUser', () => {
  it('加密後送到每台裝置，已取消訂閱的裝置會被刪掉', async () => {
    const { sendToUser } = await import('./push-server');
    let subs = [fakeSubscription('/ok'), fakeSubscription('/gone')];
    const repo = {
      listSubscriptions: async () => subs,
      removeSubscription: async (endpoint: string) => {
        subs = subs.filter((s) => s.endpoint !== endpoint);
      },
    } as unknown as NotificationRepository;

    const sent = await sendToUser(repo, 'alice', { title: '看房提醒', body: '30 分鐘後去看房', url: '/listing/1' });

    expect(sent).toBe(1);
    expect(received.map((r) => r.path).sort()).toEqual(['/gone', '/ok']);
    const ok = received.find((r) => r.path === '/ok');
    expect(ok?.headers['content-encoding']).toBe('aes128gcm');
    expect(String(ok?.headers.authorization)).toMatch(/^vapid t=/);
    expect(ok?.bytes).toBeGreaterThan(0);
    expect(subs.map((s) => s.endpoint)).toEqual([`${base}/ok`]);
  });
});
