import { getRepositories } from './data';
import { toPublicListing, type PublicListing } from './data/access';

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

/** 用分享連結的 token 找出那間物件（只回傳公開欄位）；token 格式不對或找不到時回傳 null */
export async function getSharedListing(token: string): Promise<PublicListing | null> {
  if (!TOKEN.test(token)) return null;
  const repos = getRepositories();
  const link = await repos.shareLinks.resolve(token);
  if (!link) return null;
  const listing = await repos.listings.get(link.ownerUid, link.listingId);
  return listing ? toPublicListing(listing) : null;
}

/** 分享預覽（LINE、FB）上的說明文字：租金、地址、房型坪數 */
export function shareDescription(l: PublicListing): string {
  const rent = l.rent != null ? `月租 $${l.rent.toLocaleString('zh-TW')}` : '';
  const spec = [l.layout, l.size].filter(Boolean).join(' · ');
  return [rent, l.address, spec].filter(Boolean).join('｜') || '租屋小幫手分享的物件';
}
