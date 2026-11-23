import { sendNotification, setVapidDetails, WebPushError } from 'web-push';
import type { PushSubscriptionRecord } from './repositories/push-subscriptions-repository';

/**
 * 推播通知（Web Push）。需要三個環境變數，沒設定時整個功能安靜地關掉：
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY、VAPID_PRIVATE_KEY：用 `npx web-push generate-vapid-keys` 產生
 * - VAPID_SUBJECT：mailto: 或網址，推播服務出問題時用來聯絡你
 */

export interface PushPayload {
  title: string;
  body: string;
  /** 點通知後打開的頁面（站內路徑） */
  url: string;
  /** 同一個 tag 的通知會互相取代 */
  tag?: string;
}

export interface PushStore {
  list(uid: string): Promise<PushSubscriptionRecord[]>;
  remove(endpoint: string): Promise<void>;
}

let configured: boolean | null = null;

export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return (configured = false);
  try {
    setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  } catch (error) {
    console.error('VAPID 設定有誤，推播通知關閉：', error);
    configured = false;
  }
  return configured;
}

/** 推給這個帳號的每一台裝置；失效的訂閱（404／410）順便刪掉。不會丟錯 */
export async function notifyUser(
  store: PushStore,
  uid: string,
  payload: PushPayload,
  send: typeof sendNotification = (sub, data, options) => sendNotification(sub, data, options),
): Promise<void> {
  if (!pushConfigured()) return;
  let subs: PushSubscriptionRecord[];
  try {
    subs = await store.list(uid);
  } catch (error) {
    console.error('Read push subscriptions failed:', error);
    return;
  }
  const data = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, data, {
          TTL: 60 * 60,
          urgency: 'high',
        });
      } catch (error) {
        const status = error instanceof WebPushError ? error.statusCode : undefined;
        if (status === 404 || status === 410) await store.remove(sub.endpoint).catch(() => undefined);
        else console.error('Send push failed:', error);
      }
    }),
  );
}

/**
 * 一次推給很多台裝置（每月運勢、功能更新）。payloadFor 回傳 null 就跳過那台；
 * 失效的訂閱（404／410）順便刪掉。回傳實際送出的數量。不會丟錯
 */
export async function sendToSubscriptions<T extends PushSubscriptionRecord>(
  store: Pick<PushStore, 'remove'>,
  subs: T[],
  payloadFor: (sub: T) => PushPayload | null,
  send: typeof sendNotification = (sub, data, options) => sendNotification(sub, data, options),
): Promise<number> {
  if (!pushConfigured()) return 0;
  let sent = 0;
  // 一次送 20 台，避免同時開太多連線
  for (let i = 0; i < subs.length; i += 20) {
    await Promise.all(
      subs.slice(i, i + 20).map(async (sub) => {
        const payload = payloadFor(sub);
        if (!payload) return;
        try {
          await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), {
            TTL: 60 * 60 * 24,
            urgency: 'normal',
          });
          sent += 1;
        } catch (error) {
          const status = error instanceof WebPushError ? error.statusCode : undefined;
          if (status === 404 || status === 410) await store.remove(sub.endpoint).catch(() => undefined);
          else console.error('Send push failed:', error);
        }
      }),
    );
  }
  return sent;
}
