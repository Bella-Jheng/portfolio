export type Status = 'contacting' | 'viewed' | 'favorite' | 'rented';

export const STATUSES: Status[] = ['contacting', 'viewed', 'favorite', 'rented'];

export const STATUS_META: Record<
  Status,
  { label: string; color: string; softBg: string; softText: string }
> = {
  contacting: { label: '聯絡中', color: '#2563EB', softBg: '#E0ECFB', softText: '#1E4E8C' },
  viewed: { label: '已看房', color: '#0F766E', softBg: '#E6F4F1', softText: '#0F5E57' },
  favorite: { label: '最想要', color: '#DB2777', softBg: '#FCE7F3', softText: '#9D174D' },
  rented: { label: '已出租', color: '#6B7480', softBg: '#EEF1F4', softText: '#3D4652' },
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
  notes: Note[];
  thumbnail?: string; // 縮小過的 data URL
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
  uncertain: ParsedField[];
}
