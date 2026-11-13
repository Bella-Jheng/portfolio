import { SOURCE_LABEL, STATUSES, type Listing } from '../types';

const isString = (v: unknown): v is string => typeof v === 'string';
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString);
const isOptionalNumber = (v: unknown) => v === undefined || v === null || (typeof v === 'number' && Number.isFinite(v));
const isIsoDate = (v: unknown) => isString(v) && !Number.isNaN(Date.parse(v));

const TEXT_FIELDS = [
  'id', 'title', 'address', 'layout', 'size', 'floor', 'fees', 'pets', 'listingNo', 'contactName', 'contactRole',
] as const;

/** 檢查前端送來的物件格式，不合格的不寫進資料庫（PostgreSQL 的欄位限制也會擋，這裡先給清楚的錯誤） */
export function isValidListing(value: unknown): value is Listing {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const l = value as Record<string, unknown>;
  return (
    TEXT_FIELDS.every((key) => isString(l[key])) &&
    isIsoDate(l.createdAt) &&
    isIsoDate(l.updatedAt) &&
    STATUSES.includes(l.status as never) &&
    Object.keys(SOURCE_LABEL).includes(l.source as string) &&
    (l.sourceUrl === undefined || isString(l.sourceUrl)) &&
    (l.favorite === undefined || typeof l.favorite === 'boolean') &&
    isOptionalNumber(l.lat) &&
    isOptionalNumber(l.lng) &&
    (isOptionalNumber(l.rent) && (l.rent == null || Number.isInteger(l.rent))) &&
    isStringArray(l.phones) &&
    isStringArray(l.lineIds) &&
    isStringArray(l.igIds) &&
    isStringArray(l.uncertain) &&
    (l.thumbnail === undefined || isString(l.thumbnail)) &&
    (l.coverImage === undefined || isString(l.coverImage)) &&
    Array.isArray(l.notes) &&
    l.notes.every(
      (n) => !!n && typeof n === 'object' && isString((n as Record<string, unknown>).id) &&
        isIsoDate((n as Record<string, unknown>).at) && isString((n as Record<string, unknown>).text),
    )
  );
}
