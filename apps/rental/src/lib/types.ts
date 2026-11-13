export type Status = 'not_contacted' | 'contacted' | 'viewed' | 'rented';

export const STATUSES: Status[] = ['not_contacted', 'contacted', 'viewed', 'rented'];

/** 「最想要」是獨立的愛心標記，可以跟任何狀態同時存在（例如已聯絡＋最想要） */
export const FAVORITE_COLOR = '#B8556B';

export const STATUS_META: Record<
  Status,
  { label: string; color: string; softBg: string; softText: string }
> = {
  not_contacted: { label: '尚未聯絡', color: '#C98A2E', softBg: '#FEF3C7', softText: '#92400E' },
  contacted: { label: '已聯絡', color: '#3F6A73', softBg: '#E3ECEC', softText: '#2F5157' },
  viewed: { label: '已看房', color: '#5B7F52', softBg: '#E8F1E3', softText: '#3F6B36' },
  rented: { label: '已出租', color: '#9A958D', softBg: '#FFFFFF', softText: '#4A4A4A' },
};

export type Source = '591' | 'fb' | 'ig' | 'other';

export const SOURCE_LABEL: Record<Source, string> = {
  '591': '591',
  fb: 'FB 社團',
  ig: 'IG',
  other: '其他',
};

export interface Note {
  id: string;
  at: string; // ISO
  text: string;
}

/** 可以被 AI 標記為「不確定」的欄位 */
export type ParsedField =
  | 'title'
  | 'address'
  | 'rent'
  | 'layout'
  | 'size'
  | 'floor'
  | 'fees'
  | 'pets'
  | 'contactName'
  | 'phones'
  | 'lineIds'
  | 'igIds'
  | 'listingNo';

export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  /** 最想要（愛心）；舊資料沒有這個欄位時視為 false */
  favorite?: boolean;
  source: Source;
  /** 房源出處：原始貼文或物件頁的網址（舊資料沒有這個欄位） */
  sourceUrl?: string;
  title: string;
  address: string;
  lat?: number;
  lng?: number;
  rent?: number;
  layout: string;
  size: string;
  floor: string;
  fees: string;
  pets: string;
  listingNo: string;
  contactName: string;
  contactRole: string;
  phones: string[];
  lineIds: string[];
  igIds: string[];
  notes: Note[];
  thumbnail?: string; // 截圖縮小過的 data URL
  coverImage?: string; // 首圖：房子的照片（跟截圖分開），縮小過的 data URL
  uncertain: ParsedField[];
}

/** AI 解析回傳的形狀（/api/parse） */
export interface ParseResult {
  title: string;
  address: string;
  rent: number | null;
  layout: string;
  size: string;
  floor: string;
  fees: string;
  pets: string;
  listingNo: string;
  contactName: string;
  contactRole: string;
  phones: string[];
  lineIds: string[];
  igIds: string[];
  uncertain: ParsedField[];
}
