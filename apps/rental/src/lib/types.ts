export type Status = 'not_contacted' | 'contacted' | 'viewed' | 'favorite' | 'rented';

export const STATUSES: Status[] = ['not_contacted', 'contacted', 'viewed', 'favorite', 'rented'];

export const STATUS_META: Record<
  Status,
  { label: string; color: string; softBg: string; softText: string }
> = {
  not_contacted: { label: '尚未聯絡', color: '#C98A2E', softBg: '#FEF3C7', softText: '#92400E' },
  contacted: { label: '已聯絡', color: '#3F6A73', softBg: '#E3ECEC', softText: '#2F5157' },
  viewed: { label: '已看房', color: '#5B7F52', softBg: '#E8F1E3', softText: '#3F6B36' },
  favorite: { label: '最想要', color: '#B8556B', softBg: '#F6E6EA', softText: '#8C3A4E' },
  rented: { label: '已出租', color: '#9A958D', softBg: '#EFEFEF', softText: '#4A4A4A' },
};

export type Source = '591' | 'fb' | 'other';

export const SOURCE_LABEL: Record<Source, string> = {
  '591': '591',
  fb: 'FB 社團',
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
  source: Source;
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
