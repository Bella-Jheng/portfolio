import type { Listing } from './types';
import { SOURCE_LABEL } from './types';
import { getProfileMessage } from './preferences';

export interface MessageTemplate {
  id: string;
  name: string;
  build: (l: Listing) => string;
}

/** 個人資訊範本：內容是使用者自己的資料，改過會記住，下一間物件直接帶入 */
export const PROFILE_TEMPLATE_ID = 'profile';

// 開頭一律用「您好」，不帶房東／房仲的名字
const GREETING = '您好';

function describe(l: Listing): string {
  const name = l.title || l.address || '這間物件';
  const rent = l.rent != null ? `（月租 ${l.rent.toLocaleString('zh-TW')}）` : '';
  const no = l.listingNo ? `，物件編號 ${l.listingNo}` : '';
  return `${name}${rent}${no}`;
}

function where(l: Listing): string {
  return l.source === 'other' ? '' : `在 ${SOURCE_LABEL[l.source]} `;
}

export const TEMPLATES: MessageTemplate[] = [
  {
    id: 'ask',
    name: '詢問是否還在',
    build: (l) =>
      `${GREETING}，我${where(l)}看到${describe(l)}，想請問：\n1. 目前還可以租嗎？\n2. 這週方便看房嗎？\n謝謝您！`,
  },
  {
    id: 'visit',
    name: '約看房',
    build: (l) =>
      `${GREETING}，想預約看${describe(l)}。\n我這週 [可以的時段] 都可以，請問哪個時段方便呢？\n謝謝您！`,
  },
  {
    id: 'detail',
    name: '問細節',
    build: (l) =>
      `${GREETING}，關於${describe(l)}想多了解：\n1. 管理費、網路費怎麼算？\n2. 最短租期多久？押金幾個月？\n3. 可以報稅、設籍嗎？\n謝謝您！`,
  },
  {
    id: PROFILE_TEMPLATE_ID,
    name: '個人資訊',
    build: () => getProfileMessage(),
  },
];
