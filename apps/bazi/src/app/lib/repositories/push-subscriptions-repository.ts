import { createHash } from 'crypto';
import { db } from '../firebase';

/** 推播通知的訂閱（baziPushSubscriptions/{endpoint 的 SHA-256}）：一台裝置（瀏覽器）一筆 */
export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** 列出全部訂閱時多帶帳號與介面語言（每月運勢、功能更新推播用） */
export interface StoredPushSubscription extends PushSubscriptionRecord {
  uid: string;
  locale: 'zh' | 'en';
}

const docId = (endpoint: string) => createHash('sha256').update(endpoint).digest('hex');

class PushSubscriptionsRepository {
  private collection() {
    return db.collection('baziPushSubscriptions');
  }

  /** 新增或更新（同一台裝置換帳號登入時改掛到新帳號） */
  async save(uid: string, sub: PushSubscriptionRecord, locale: 'zh' | 'en' = 'zh'): Promise<void> {
    await this.collection().doc(docId(sub.endpoint)).set({ ...sub, uid, locale, createdAt: new Date().toISOString() });
  }

  async listAll(): Promise<StoredPushSubscription[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map((d) => {
      const { endpoint, p256dh, auth, uid, locale } = d.data();
      return { endpoint, p256dh, auth, uid, locale: locale === 'en' ? 'en' : 'zh' } as StoredPushSubscription;
    });
  }

  async list(uid: string): Promise<PushSubscriptionRecord[]> {
    const snapshot = await this.collection().where('uid', '==', uid).get();
    return snapshot.docs.map((d) => {
      const { endpoint, p256dh, auth } = d.data();
      return { endpoint, p256dh, auth } as PushSubscriptionRecord;
    });
  }

  async remove(endpoint: string): Promise<void> {
    await this.collection().doc(docId(endpoint)).delete();
  }
}

export const pushSubscriptionsRepository = new PushSubscriptionsRepository();
