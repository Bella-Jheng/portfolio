import { readingsRepository } from './repositories/readings-repository';
import { pushSubscriptionsRepository, type StoredPushSubscription } from './repositories/push-subscriptions-repository';
import { sendToSubscriptions, type PushPayload } from './push-notify';
import { MONTH_NAMES_EN } from './i18n/messages';

/**
 * 每月 1 號推播「本月運勢出爐」：只送提醒，不先用 AI 產生；
 * 使用者點開通知進到結果頁的「本月運勢」，那時候才用 AI 算（沒點開的人不花 AI 費用）
 */
export async function sendMonthlyFortunePush(now: Date = new Date()): Promise<{ users: number; sent: number }> {
  const subs = await pushSubscriptionsRepository.listAll();
  // 一個帳號查一次命盤；沒有正式命盤的（例如訪客體驗）不推
  const readingByUid = new Map<string, string | null>();
  for (const uid of new Set(subs.map((sub) => sub.uid))) {
    const reading = await readingsRepository.findLatestByUser(uid).catch(() => null);
    readingByUid.set(uid, reading?.id ?? null);
  }
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', month: 'numeric' }).format(now));
  const sent = await sendToSubscriptions(pushSubscriptionsRepository, subs, (sub: StoredPushSubscription): PushPayload | null => {
    const readingId = readingByUid.get(sub.uid);
    if (!readingId) return null;
    const url = `/result/${readingId}?tab=monthly`;
    return sub.locale === 'en'
      ? { title: `Your ${MONTH_NAMES_EN[month - 1]} outlook is here 🌙`, body: 'Tap to see what this month holds for you.', url, tag: 'monthly-fortune' }
      : { title: `${month} 月運勢出爐囉 🌙`, body: '點開看看命格貓幫你算的這個月運勢', url, tag: 'monthly-fortune' };
  });
  return { users: [...readingByUid.values()].filter(Boolean).length, sent };
}

export interface FeatureUpdateMessage {
  titleZh: string;
  bodyZh: string;
  titleEn?: string;
  bodyEn?: string;
  url?: string;
}

/** 功能更新提醒：推給所有開啟通知的裝置，依每台裝置的介面語言選中文或英文 */
export async function sendFeatureUpdatePush(message: FeatureUpdateMessage): Promise<{ sent: number }> {
  const subs = await pushSubscriptionsRepository.listAll();
  const url = message.url?.startsWith('/') ? message.url : '/feedback';
  const sent = await sendToSubscriptions(pushSubscriptionsRepository, subs, (sub) =>
    sub.locale === 'en' && message.titleEn
      ? { title: message.titleEn, body: message.bodyEn ?? '', url, tag: 'feature-update' }
      : { title: message.titleZh, body: message.bodyZh, url, tag: 'feature-update' },
  );
  return { sent };
}
