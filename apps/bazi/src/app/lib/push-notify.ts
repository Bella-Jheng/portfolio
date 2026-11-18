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
