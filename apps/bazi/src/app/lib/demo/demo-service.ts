import { getFirestore } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '../firebase';
import {
  DEMO_META_COLLECTION,
  DEMO_READINGS_COLLECTION,
  demoDay,
  demoGlobalDailyAi,
  demoReadingId,
} from './demo-config';
import { fallbackDemoReading, fromTemplate } from './demo-reading';

// 直接拿 Firestore 本體（不經過 lib/firebase 的 Proxy）：交易、遞迴刪除會在物件上掛內部狀態
function firestore() {
  getAdminAuth(); // 確保 Firebase app 已經初始化
  return getFirestore();
}

/** Firebase 匿名登入的帳號（訪客 Demo） */
export function isAnonymousToken(decoded: DecodedIdToken): boolean {
  return decoded.firebase?.sign_in_provider === 'anonymous';
}

/**
 * 確保這個訪客今天有一份範例命盤：今天還沒放過（或是昨天的）就換成新的，回傳命盤 id。
 * 只寫進 Demo 專用的集合，正式的 readings 不會多出任何資料。
 */
export async function ensureDemoReading(uid: string): Promise<string> {
  const id = demoReadingId(uid);
  const db = firestore();
  const ref = db.collection(DEMO_READINGS_COLLECTION).doc(id);
  const today = demoDay();
  const snap = await ref.get();
  if (snap.exists && snap.get('seededOn') === today) return id;

  let content = fallbackDemoReading();
  const templateId = process.env.DEMO_TEMPLATE_READING_ID;
  if (templateId) {
    const template = await db.collection('readings').doc(templateId).get();
    if (template.exists) content = fromTemplate(template.data() ?? {});
    else console.warn(`DEMO_TEMPLATE_READING_ID ${templateId} 找不到，改用內建範例`);
  }
  await ref.set({
    ...content,
    createdBy: uid,
    questions: [],
    createdAt: new Date().toISOString(),
    seededOn: today,
    demo: true,
  });
  return id;
}

export class DemoLimitError extends Error {}

/**
 * 訪客 Demo 用一次 AI：perUser 有給就檢查並累加這個訪客今天這一類的次數（追問另外用命盤裡的紀錄算，不經過這裡）；
 * 所有訪客加起來另有每日總上限。超過上限丟出 DemoLimitError。
 */
export async function chargeDemoAi(uid: string, kind: 'question' | 'detail' | 'translate', perUserLimit?: number): Promise<void> {
  const db = firestore();
  const day = demoDay();
  const globalRef = db.collection(DEMO_META_COLLECTION).doc(`usage-${day}`);
  const userRef = db.collection(DEMO_META_COLLECTION).doc(`usage-${day}-${uid}`);
  const total = demoGlobalDailyAi();
  const ok = await db.runTransaction(async (tx) => {
    const [all, mine] = await Promise.all([tx.get(globalRef), tx.get(userRef)]);
    const usedAll = (all.get('count') as number | undefined) ?? 0;
    const used = (mine.get(kind) as number | undefined) ?? 0;
    if (usedAll >= total) return false;
    if (perUserLimit !== undefined && used >= perUserLimit) return false;
    tx.set(globalRef, { count: usedAll + 1, day }, { merge: true });
    tx.set(userRef, { [kind]: used + 1, day, uid }, { merge: true });
    return true;
  });
  if (!ok) throw new DemoLimitError('今天的體驗次數用完了，明天再來玩，或用 Google 登入排自己的命盤');
}

/** 每日排程：清空所有 Demo 資料，並刪掉一天以上沒用的匿名帳號（正式資料完全不碰） */
export async function purgeDemoData(): Promise<{ users: number }> {
  const db = firestore();
  await db.recursiveDelete(db.collection(DEMO_READINGS_COLLECTION));
  await db.recursiveDelete(db.collection(DEMO_META_COLLECTION));
  const auth = getAdminAuth();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  let users = 0;
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    // 匿名帳號沒有任何登入方式（providerData 是空的）
    const stale = page.users
      .filter((u) => u.providerData.length === 0)
      .filter((u) => Date.parse(u.metadata.lastRefreshTime ?? u.metadata.lastSignInTime) < cutoff)
      .map((u) => u.uid);
    if (stale.length > 0) users += (await auth.deleteUsers(stale)).successCount;
    pageToken = page.pageToken;
  } while (pageToken);
  return { users };
}
