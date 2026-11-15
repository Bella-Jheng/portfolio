import webpush from 'web-push';
import type { NotificationRepository, PushSubscriptionRecord } from './data/types';

/**
 * 伺服器送推播（Web Push）。VAPID 金鑰用 `npx web-push generate-vapid-keys` 產生：
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY：公鑰，前端訂閱時也要用
 * - VAPID_PRIVATE_KEY：私鑰，只放伺服器
 * - VAPID_SUBJECT：聯絡方式，例如 mailto:you@gmail.com
 */
export function isPushConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

let configured = false;
function setup() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
  configured = true;
}

export interface PushMessage {
  title: string;
  body: string;
  /** 點通知要打開的頁面 */
  url: string;
  /** 同一個 tag 的通知會取代舊的，不會疊一堆 */
  tag?: string;
}

/** 送給這個帳號的所有裝置；裝置已經取消訂閱（404／410）就順便刪掉。回傳成功送出的數量 */
export async function sendToUser(
  notifications: NotificationRepository,
  uid: string,
  message: PushMessage,
): Promise<number> {
  setup();
  const subscriptions = await notifications.listSubscriptions(uid);
  const results = await Promise.all(
    subscriptions.map(async (subscription: PushSubscriptionRecord) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(message), { TTL: 60 * 60 });
        return true;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await notifications.removeSubscription(subscription.endpoint);
        else console.error('Push failed:', status, error);
        return false;
      }
    }),
  );
  return results.filter(Boolean).length;
}
