import type { Listing } from '../types';
import { ForbiddenError, type Repositories } from './types';

/**
 * 誰可以看、可以改哪些物件（跟資料庫無關，Firestore／PostgreSQL 共用）：
 * - 自己的物件：可以看、改、刪、產生分享連結
 * - 別人邀請我一起找房：可以看、改他的物件，但不能刪，也不能產生分享連結
 * - 分享連結：不用登入就能看那一間，但只看得到公開的欄位
 */

/** 我的物件＋別人共用給我的物件（共用的會標上 sharedBy） */
export async function listForUser(repos: Repositories, uid: string, email: string): Promise<Listing[]> {
  const [own, owners] = await Promise.all([repos.listings.list(uid), repos.members.listOwners(email)]);
  const shared = await Promise.all(
    owners
      .filter((owner) => owner.uid !== uid)
      .map(async (owner) =>
        (await repos.listings.list(owner.uid)).map((l) => ({ ...l, sharedBy: { uid: owner.uid, email: owner.email } })),
      ),
  );
  return [...own, ...shared.flat()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 存一間物件：共用來的物件寫回擁有者那邊，前提是對方真的邀請了我 */
export async function saveListing(repos: Repositories, uid: string, email: string, listing: Listing): Promise<void> {
  const { sharedBy, ...data } = listing;
  const ownerUid = sharedBy && sharedBy.uid !== uid ? sharedBy.uid : uid;
  if (ownerUid !== uid && !(await repos.members.isMember(ownerUid, email))) {
    throw new ForbiddenError('對方沒有共用這份清單給你，或已經取消共用');
  }
  await repos.listings.upsert(ownerUid, data);
}

/** 分享連結頁看得到的欄位：不含備註、AI 不確定標記、愛心這些私人資訊 */
export type PublicListing = Omit<Listing, 'notes' | 'uncertain' | 'favorite' | 'sharedBy'>;

export function toPublicListing(listing: Listing): PublicListing {
  const { notes: _notes, uncertain: _uncertain, favorite: _favorite, sharedBy: _sharedBy, ...rest } = listing;
  return rest;
}
