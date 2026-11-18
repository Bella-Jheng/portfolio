import type { Listing, ParseResult } from '../types';

/**
 * 資料存取層（Repository）：API route 只依賴這些介面，不直接碰資料庫。
 * 目前有兩種實作，用環境變數 DATA_BACKEND 切換（見 index.ts）：
 * - firestore.ts：Firebase Firestore（預設）
 * - postgres.ts：PostgreSQL 關聯式資料庫
 * 換資料庫只要新增一個實作，API 和畫面都不用改。
 */

/** 物件：每個帳號只能讀寫自己的物件 */
export interface ListingRepository {
  /** 這個帳號的所有物件，新建立的在前 */
  list(ownerUid: string): Promise<Listing[]>;
  /** 讀單一間；不存在時回傳 null */
  get(ownerUid: string, id: string): Promise<Listing | null>;
  /** 新增或整筆覆蓋；id 已屬於別的帳號時丟出 ForbiddenError */
  upsert(ownerUid: string, listing: Listing): Promise<void>;
  remove(ownerUid: string, id: string): Promise<void>;
}

/** 使用者：把登入憑證裡的 uid 和 email 對應記下來，後台才看得出每份資料是誰的 */
export interface UserRepository {
  /** 登入同步時呼叫：記錄（或更新）這個 uid 的 email 與最後登入時間 */
  recordLogin(uid: string, email: string): Promise<void>;
}

/** 個人偏好（目前是私訊範本） */
export interface PreferencesRepository {
  /** 還沒存過時回傳 null */
  getTemplates(uid: string): Promise<Record<string, string> | null>;
  saveTemplates(uid: string, templates: Record<string, string>): Promise<void>;
}

/** 一起找房：擁有者邀請別人（用 email）共用自己的物件清單，被邀請的人可以看、可以修改 */
export interface MemberRepository {
  /** 我邀請了哪些人 */
  listMembers(ownerUid: string): Promise<string[]>;
  /** 哪些人邀請了我 */
  listOwners(memberEmail: string): Promise<{ uid: string; email: string }[]>;
  isMember(ownerUid: string, memberEmail: string): Promise<boolean>;
  add(ownerUid: string, ownerEmail: string, memberEmail: string): Promise<void>;
  remove(ownerUid: string, memberEmail: string): Promise<void>;
}

/** 分享單一物件的連結：拿到連結的人不用登入就能看（只能看） */
export interface ShareLinkRepository {
  getToken(ownerUid: string, listingId: string): Promise<string | null>;
  create(ownerUid: string, listingId: string, token: string): Promise<void>;
  revoke(ownerUid: string, listingId: string): Promise<void>;
  resolve(token: string): Promise<{ ownerUid: string; listingId: string } | null>;
}

/** AI 解析工作：上傳截圖後伺服器在背景解析，前端切到別的 App 再回來也拿得到結果 */
export type ParseJobStatus = 'pending' | 'done' | 'error';

export interface ParseJob {
  id: string;
  status: ParseJobStatus;
  result?: ParseResult;
  error?: string;
  createdAt: string;
}

export interface ParseJobRepository {
  /** 建立一筆等待中的工作；順便清掉這個帳號一天以前的舊工作 */
  create(ownerUid: string, id: string): Promise<void>;
  /** 只讀得到自己的工作；不存在時回傳 null */
  get(ownerUid: string, id: string): Promise<ParseJob | null>;
  complete(ownerUid: string, id: string, result: ParseResult): Promise<void>;
  fail(ownerUid: string, id: string, error: string): Promise<void>;
}

/** 推播通知的訂閱：一台裝置（瀏覽器）一筆，endpoint 是瀏覽器給的推播網址 */
export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRepository {
  /** 新增或更新（同一個 endpoint 換帳號登入時改掛到新帳號） */
  save(ownerUid: string, sub: PushSubscriptionRecord): Promise<void>;
  list(ownerUid: string): Promise<PushSubscriptionRecord[]>;
  /** 使用者關掉通知，或推播服務回報這個 endpoint 已失效時刪掉 */
  remove(endpoint: string): Promise<void>;
}

/** 可以使用 AI 與雲端資料的帳號白名單 */
export interface AllowlistRepository {
  isAllowed(email: string): Promise<boolean>;
}

export interface Repositories {
  listings: ListingRepository;
  users: UserRepository;
  preferences: PreferencesRepository;
  allowlist: AllowlistRepository;
  members: MemberRepository;
  shareLinks: ShareLinkRepository;
  parseJobs: ParseJobRepository;
  pushSubscriptions: PushSubscriptionRepository;
}

export class ForbiddenError extends Error {}
