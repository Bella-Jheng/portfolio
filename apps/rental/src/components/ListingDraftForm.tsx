'use client';

import clsx from 'clsx';
import { CheckIcon } from './icons';
import type { ParsedField, ParseResult } from '../lib/types';

/** AI 解析完、還沒儲存的草稿。電話／LINE／IG 用文字存，方便直接打逗號輸入多筆 */
export interface DraftValues {
  title: string;
  rent: string;
  address: string;
  layout: string;
  size: string;
  floor: string;
  fees: string;
  pets: string;
  listingNo: string;
  contactName: string;
  contactRole: string;
  phones: string;
  lineIds: string;
  igIds: string;
  uncertain: ParsedField[];
}

const LIST_SEPARATOR = '、';

export function draftFromResult(result: ParseResult): DraftValues {
  return {
    title: result.title,
    rent: result.rent != null ? String(result.rent) : '',
    address: result.address,
    layout: result.layout,
    size: result.size,
    floor: result.floor,
    fees: result.fees,
    pets: result.pets,
    listingNo: result.listingNo,
    contactName: result.contactName,
    contactRole: result.contactRole,
    phones: result.phones.join(LIST_SEPARATOR),
    lineIds: result.lineIds.join(LIST_SEPARATOR),
    igIds: (result.igIds ?? []).join(LIST_SEPARATOR),
    uncertain: result.uncertain,
  };
}

/** 逗號、頓號、換行都當作分隔 */
export function splitList(value: string): string[] {
  return value
    .split(/[,，、\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseRent(value: string): number | undefined {
  const n = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

type TextKey = Exclude<keyof DraftValues, 'uncertain'>;

const FIELDS: {
  key: TextKey;
  label: string;
  parsed?: ParsedField;
  inputMode?: 'numeric' | 'tel';
  hint?: string;
}[] = [
  { key: 'title', label: '標題', parsed: 'title' },
  { key: 'rent', label: '租金（每月）', parsed: 'rent', inputMode: 'numeric' },
  { key: 'address', label: '地址', parsed: 'address' },
  { key: 'layout', label: '房型', parsed: 'layout' },
  { key: 'size', label: '坪數', parsed: 'size' },
  { key: 'floor', label: '樓層', parsed: 'floor' },
  { key: 'fees', label: '費用與條件', parsed: 'fees' },
  { key: 'pets', label: '寵物', parsed: 'pets' },
  { key: 'listingNo', label: '物件編號', parsed: 'listingNo' },
  { key: 'contactName', label: '聯絡人', parsed: 'contactName' },
  { key: 'contactRole', label: '身分（房東、代管、仲介）' },
  { key: 'phones', label: '電話', parsed: 'phones', inputMode: 'tel', hint: '多筆用頓號或逗號分隔' },
  { key: 'lineIds', label: 'LINE ID', parsed: 'lineIds', hint: '多筆用頓號或逗號分隔' },
  { key: 'igIds', label: 'IG 帳號', parsed: 'igIds', hint: '多筆用頓號或逗號分隔' },
];

export function ListingDraftForm({
  draft,
  onChange,
  heading,
}: {
  draft: DraftValues;
  onChange: (draft: DraftValues) => void;
  heading?: string;
}) {
  const setField = (key: TextKey, value: string, parsed?: ParsedField) =>
    onChange({
      ...draft,
      [key]: value,
      // 使用者改過的欄位就不再標成「AI 不確定」
      uncertain: parsed ? draft.uncertain.filter((f) => f !== parsed) : draft.uncertain,
    });

  return (
    <section className="card flex flex-col gap-3 p-4">
      {heading && <h2 className="text-[15px] font-bold">{heading}</h2>}
      {FIELDS.map(({ key, label, parsed, inputMode, hint }) => {
        const uncertain = parsed != null && draft.uncertain.includes(parsed);
        return (
          <div key={key} className={clsx('flex flex-col gap-1', uncertain && '-mx-2 rounded-xl bg-warn-bg p-2')}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={`draft-${key}`} className={clsx('text-xs', uncertain ? 'text-warn-text' : 'text-sub')}>
                {label}
                {uncertain && ' · 請確認'}
                {hint && !uncertain && <span className="text-sub/70"> · {hint}</span>}
              </label>
              {uncertain && (
                // 內容正確不用改，按這個就把黃色標記拿掉
                <button
                  type="button"
                  onClick={() => onChange({ ...draft, uncertain: draft.uncertain.filter((f) => f !== parsed) })}
                  className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-xs font-medium text-warn-text"
                >
                  <CheckIcon size={13} />
                  沒問題
                </button>
              )}
            </div>
            <input
              id={`draft-${key}`}
              className="field-input"
              value={draft[key]}
              inputMode={inputMode}
              type={inputMode === 'tel' ? 'tel' : 'text'}
              onChange={(e) => setField(key, e.target.value, parsed)}
            />
          </div>
        );
      })}
    </section>
  );
}
