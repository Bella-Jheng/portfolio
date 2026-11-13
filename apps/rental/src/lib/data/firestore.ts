import type { Firestore } from 'firebase-admin/firestore';
import type { Listing } from '../types';
import type { Repositories } from './types';

/**
 * Firestore 實作。跟 apps/bazi 共用同一個 Firebase 專案，所以集合名稱都加 rental 前綴：
 * - rentalAllowedUsers/{小寫 email}   白名單
 * - rentalUsers/{uid}                 偏好設定（templates）
 * - rentalUsers/{uid}/listings/{id}   物件（整筆存成一份文件）
 * 資料放在各自的 uid 底下，天生就只讀得到自己的物件。
 */
export function createFirestoreRepositories(db: Firestore): Repositories {
  const userDoc = (uid: string) => db.collection('rentalUsers').doc(uid);
  const listings = (uid: string) => userDoc(uid).collection('listings');

  return {
    listings: {
      async list(ownerUid) {
        const snapshot = await listings(ownerUid).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map((doc) => doc.data() as Listing);
      },
      async upsert(ownerUid, listing) {
        await listings(ownerUid).doc(listing.id).set(listing);
      },
      async remove(ownerUid, id) {
        await listings(ownerUid).doc(id).delete();
      },
    },
    preferences: {
      async getTemplates(uid) {
        const doc = await userDoc(uid).get();
        return (doc.data()?.templates as Record<string, string> | undefined) ?? null;
      },
      async saveTemplates(uid, templates) {
        await userDoc(uid).set({ templates, updatedAt: new Date().toISOString() }, { merge: true });
      },
    },
    allowlist: {
      async isAllowed(email) {
        const doc = await db.collection('rentalAllowedUsers').doc(email.toLowerCase()).get();
        return doc.exists;
      },
    },
  };
}
