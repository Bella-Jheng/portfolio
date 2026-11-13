import type { Listing } from '../types';

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

/** 可以使用 AI 與雲端資料的帳號白名單 */
export interface AllowlistRepository {
  isAllowed(email: string): Promise<boolean>;
}

export interface Repositories {
  listings: ListingRepository;
  preferences: PreferencesRepository;
  allowlist: AllowlistRepository;
  members: MemberRepository;
  shareLinks: ShareLinkRepository;
}

export class ForbiddenError extends Error {}
