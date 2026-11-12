/** 電話：只留數字和 +，給 tel: 用 */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** LINE ID 看起來其實是手機號碼（貼文常寫「LINE 同電話」） */
export function lineIsPhone(lineId: string): boolean {
  return /^(\+?886|0)9\d{8}$/.test(lineId.replace(/[\s-]/g, ''));
}

/**
 * 開 LINE 加好友頁：
 * - 官方帳號（@開頭）→ line.me/R/ti/p/@id
 * - 一般 ID → line.me/R/ti/p/~id
 * - 手機號碼 → LINE 沒有用電話直接開的連結，改開「加入好友」頁讓使用者貼上搜尋
 */
export function lineHref(lineId: string): string {
  const id = lineId.trim();
  if (lineIsPhone(id)) return 'https://line.me/R/nv/addFriends';
  if (id.startsWith('@')) return `https://line.me/R/ti/p/${encodeURIComponent(id)}`;
  return `https://line.me/R/ti/p/~${encodeURIComponent(id)}`;
}

export function mapsSearchHref(address: string, lat?: number, lng?: number): string {
  const query = address || (lat != null && lng != null ? `${lat},${lng}` : '');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsHref(address: string, lat?: number, lng?: number): string {
  const dest = lat != null && lng != null ? `${lat},${lng}` : address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatRent(rent?: number): string {
  return rent != null ? `$${rent.toLocaleString('zh-TW')}` : '租金未填';
}
