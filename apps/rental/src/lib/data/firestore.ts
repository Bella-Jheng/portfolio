import { createHash } from 'crypto';
import type { Firestore } from 'firebase-admin/firestore';
import type { Listing } from '../types';
import type { ParseJob, Repositories } from './types';

/**
 * Firestore 實作。跟 apps/bazi 共用同一個 Firebase 專案，所以集合名稱都加 rental 前綴：
 * - rentalAllowedUsers/{小寫 email}   白名單
 * - rentalUsers/{uid}                 email、最後登入時間、偏好設定（templates）
 * - rentalUsers/{uid}/listings/{id}   物件（整筆存成一份文件）
 * - rentalMembers/{ownerUid}__{email} 一起找房的成員
 * - rentalShareLinks/{token}          單一物件的分享連結
 * - rentalParseJobs/{id}             AI 解析工作（背景執行），一天後清掉
 * - rentalPushSubscriptions/{hash}   推播通知的訂閱（文件 id 是 endpoint 的 SHA-256，endpoint 太長又有斜線）
 * 資料放在各自的 uid 底下，天生就只讀得到自己的物件。
 */
export function createFirestoreRepositories(db: Firestore): Repositories {
  const userDoc = (uid: string) => db.collection('rentalUsers').doc(uid);
  const listings = (uid: string) => userDoc(uid).collection('listings');
  const members = db.collection('rentalMembers');
  const shareLinks = db.collection('rentalShareLinks');
  const parseJobs = db.collection('rentalParseJobs');
  const pushSubs = db.collection('rentalPushSubscriptions');
  const subId = (endpoint: string) => createHash('sha256').update(endpoint).digest('hex');
  const memberId = (ownerUid: string, email: string) => `${ownerUid}__${email.toLowerCase()}`;
  const linksOf = (ownerUid: string, listingId: string) =>
    shareLinks.where('ownerUid', '==', ownerUid).where('listingId', '==', listingId).get();

  return {
    listings: {
      async list(ownerUid) {
        const snapshot = await listings(ownerUid).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map((doc) => doc.data() as Listing);
      },
      async get(ownerUid, id) {
        const doc = await listings(ownerUid).doc(id).get();
        return doc.exists ? (doc.data() as Listing) : null;
      },
      async upsert(ownerUid, listing) {
        await listings(ownerUid).doc(listing.id).set(listing);
      },
      async remove(ownerUid, id) {
        // 物件刪掉時，分享連結也一起失效
        const links = await linksOf(ownerUid, id);
        await Promise.all([listings(ownerUid).doc(id).delete(), ...links.docs.map((d) => d.ref.delete())]);
      },
    },
    users: {
      async recordLogin(uid, email) {
        // merge：不會蓋掉同一份文件裡的 templates
        await userDoc(uid).set({ email: email.toLowerCase(), lastLoginAt: new Date().toISOString() }, { merge: true });
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
    members: {
      async listMembers(ownerUid) {
        const snapshot = await members.where('ownerUid', '==', ownerUid).get();
        return snapshot.docs.map((d) => d.data().memberEmail as string).sort();
      },
      async listOwners(memberEmail) {
        const snapshot = await members.where('memberEmail', '==', memberEmail.toLowerCase()).get();
        return snapshot.docs.map((d) => ({ uid: d.data().ownerUid as string, email: d.data().ownerEmail as string }));
      },
      async isMember(ownerUid, memberEmail) {
        return (await members.doc(memberId(ownerUid, memberEmail)).get()).exists;
      },
      async add(ownerUid, ownerEmail, memberEmail) {
        await members.doc(memberId(ownerUid, memberEmail)).set({
          ownerUid,
          ownerEmail: ownerEmail.toLowerCase(),
          memberEmail: memberEmail.toLowerCase(),
          createdAt: new Date().toISOString(),
        });
      },
      async remove(ownerUid, memberEmail) {
        await members.doc(memberId(ownerUid, memberEmail)).delete();
      },
    },
    shareLinks: {
      async getToken(ownerUid, listingId) {
        const snapshot = await linksOf(ownerUid, listingId);
        return snapshot.docs[0]?.id ?? null;
      },
      async create(ownerUid, listingId, token) {
        await shareLinks.doc(token).set({ ownerUid, listingId, createdAt: new Date().toISOString() });
      },
      async revoke(ownerUid, listingId) {
        const snapshot = await linksOf(ownerUid, listingId);
        await Promise.all(snapshot.docs.map((d) => d.ref.delete()));
      },
      async resolve(token) {
        const doc = await shareLinks.doc(token).get();
        if (!doc.exists) return null;
        return { ownerUid: doc.data()?.ownerUid as string, listingId: doc.data()?.listingId as string };
      },
    },
    parseJobs: {
      async create(ownerUid, id) {
        // 只用 ownerUid 一個條件查（兩個欄位一起篩選要另建複合索引），舊的在這裡挑出來刪
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const mine = await parseJobs.where('ownerUid', '==', ownerUid).get();
        const stale = mine.docs.filter((d) => String(d.data().createdAt ?? '') < cutoff);
        await Promise.all(stale.map((d) => d.ref.delete()));
        await parseJobs.doc(id).set({ ownerUid, status: 'pending', createdAt: new Date().toISOString() });
      },
      async get(ownerUid, id) {
        const doc = await parseJobs.doc(id).get();
        const data = doc.data();
        if (!doc.exists || !data || data.ownerUid !== ownerUid) return null;
        return {
          id,
          status: data.status as ParseJob['status'],
          ...(data.result ? { result: data.result as ParseJob['result'] } : {}),
          ...(data.error ? { error: data.error as string } : {}),
          createdAt: data.createdAt as string,
        };
      },
      async complete(ownerUid, id, result) {
        await parseJobs.doc(id).update({ status: 'done', result, updatedAt: new Date().toISOString() });
      },
      async fail(ownerUid, id, error) {
        await parseJobs.doc(id).update({ status: 'error', error, updatedAt: new Date().toISOString() });
      },
    },
    pushSubscriptions: {
      async save(ownerUid, sub) {
        await pushSubs.doc(subId(sub.endpoint)).set({ ...sub, ownerUid, createdAt: new Date().toISOString() });
      },
      async list(ownerUid) {
        const snapshot = await pushSubs.where('ownerUid', '==', ownerUid).get();
        return snapshot.docs.map((d) => {
          const { endpoint, p256dh, auth } = d.data();
          return { endpoint, p256dh, auth } as { endpoint: string; p256dh: string; auth: string };
        });
      },
      async remove(endpoint) {
        await pushSubs.doc(subId(endpoint)).delete();
      },
    },
  };
}
