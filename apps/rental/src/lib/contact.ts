import type { Source } from './types';

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

/** IG 帳號：去掉 @、網址前綴與結尾斜線，只留帳號名稱 */
export function igHandle(igId: string): string {
  return igId
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
}

/** 開 IG 個人頁 */
export function igHref(igId: string): string {
  return `https://www.instagram.com/${encodeURIComponent(igHandle(igId))}/`;
}

/** 直接開 IG 私訊對話 */
export function igDmHref(igId: string): string {
  return `https://ig.me/m/${encodeURIComponent(igHandle(igId))}`;
}

/** 房源出處網址：補上 https://，只接受 http(s)，避免 javascript: 之類的連結 */
export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) return '';
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  return /^https?:\/\//i.test(withScheme) ? withScheme : '';
}

/** 依網址猜來源：591、FB、IG；猜不出來回傳 null */
export function detectSource(url: string): Source | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.endsWith('591.com.tw')) return '591';
    if (host.endsWith('facebook.com') || host === 'fb.com' || host.endsWith('fb.me')) return 'fb';
    if (host.endsWith('instagram.com')) return 'ig';
  } catch {
    /* 不是合法網址 */
  }
  return null;
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

/** 建立時間：完整格式，例如「2026/11/12 15:30」 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 建立時間：清單用的簡短格式，例如「11/12」 */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatRent(rent?: number): string {
  return rent != null ? `$${rent.toLocaleString('zh-TW')}` : '租金未填';
}
