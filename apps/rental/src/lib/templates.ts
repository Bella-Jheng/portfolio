import type { Listing } from './types';
import { SOURCE_LABEL } from './types';
import { usePreferences } from './preferences';

export interface MessageTemplate {
  id: string;
  name: string;
  /** 預設文字；{物件}、{來源} 會在產生私訊時換成這間物件的資料 */
  defaultText: string;
}

/** 個人資訊範本：內容是使用者自己的資料，在物件頁改過也會記住，下一間物件直接帶入 */
export const PROFILE_TEMPLATE_ID = 'profile';

export const TEMPLATE_VARIABLES = [
  { token: '{物件}', description: '物件名稱、月租和物件編號' },
  { token: '{來源}', description: '「在 591 」「在 FB 社團 」，來源是其他時為空白' },
];

// 開頭一律用「您好」，不帶房東／房仲的名字
export const TEMPLATES: MessageTemplate[] = [
  {
    id: 'ask',
    name: '詢問是否還在',
    defaultText: '您好，我{來源}看到{物件}，想請問：\n1. 目前還可以租嗎？\n2. 這週方便看房嗎？\n謝謝您！',
  },
  {
    id: 'visit',
    name: '約看房',
    defaultText: '您好，想預約看{物件}。\n我這週 [可以的時段] 都可以，請問哪個時段方便呢？\n謝謝您！',
  },
  {
    id: 'detail',
    name: '問細節',
    defaultText:
      '您好，關於{物件}想多了解：\n1. 管理費、網路費怎麼算？\n2. 最短租期多久？押金幾個月？\n3. 可以報稅、設籍嗎？\n謝謝您！',
  },
  {
    id: PROFILE_TEMPLATE_ID,
    name: '個人資訊',
    defaultText: `‼️以下為個人資訊，請勿轉傳，如需分享請事先詢問‼️
地點偏好：
預算：
房型偏好：
可接受爬梯樓層：
是否需停汽車：

寵物類型（幾隻）：
是/否 租屋補助：

預計入住人數（關係）：
預計入住日期(可起租日)：

年齡：
職業：
聯絡電話：`,
  },
];

function describe(l: Listing): string {
  const name = l.title || l.address || '這間物件';
  const rent = l.rent != null ? `（月租 ${l.rent.toLocaleString('zh-TW')}）` : '';
  const no = l.listingNo ? `，物件編號 ${l.listingNo}` : '';
  return `${name}${rent}${no}`;
}

function where(l: Listing): string {
  return l.source === 'other' ? '' : `在 ${SOURCE_LABEL[l.source]} `;
}

/** 使用者自訂過就用自訂的，否則用預設文字（尚未代入物件資料） */
export function getTemplateText(template: MessageTemplate): string {
  return usePreferences.getState().templates[template.id] ?? template.defaultText;
}

/** 產生這間物件的私訊：把 {物件}、{來源} 換成實際資料 */
export function buildMessage(template: MessageTemplate, l: Listing): string {
  return getTemplateText(template).replaceAll('{物件}', describe(l)).replaceAll('{來源}', where(l));
}
