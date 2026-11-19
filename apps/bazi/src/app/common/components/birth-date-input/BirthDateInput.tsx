'use client';

import { useEffect, useState } from 'react';
import { SHICHEN } from '../../../types/bazi';
import { useLocale } from '../../../lib/i18n/locale-context';
import type { MessageKey } from '../../../lib/i18n/messages';

export type BirthDateValue = {
  year: number;
  month: number;
  day: number;
  hour: number | null;
};

interface Props {
  value: BirthDateValue;
  onChange: (value: BirthDateValue) => void;
}

const fieldClass =
  'bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-2 py-3 text-[#4A4A4A] text-sm text-center focus:outline-none focus:border-[#FCD060] transition-colors w-full';

const selectClass =
  'bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-3 py-3 text-[#4A4A4A] focus:outline-none focus:border-[#FCD060] transition-colors text-sm w-full';

const labelClass = 'text-[#4A4A4A] text-xs font-bold tracking-widest';

const dateFields: { label: MessageKey; key: 'year' | 'month' | 'day'; min: number; max: number }[] = [
  { label: 'form.year', key: 'year', min: 1900, max: 2100 },
  { label: 'form.month', key: 'month', min: 1, max: 12 },
  { label: 'form.day', key: 'day', min: 1, max: 31 },
];

// 英文介面的時辰：11:00–13:00 · Wu hour (午)
const SHICHEN_PINYIN: Record<string, string> = {
  子: 'Zi', 丑: 'Chou', 寅: 'Yin', 卯: 'Mao', 辰: 'Chen', 巳: 'Si',
  午: 'Wu', 未: 'Wei', 申: 'Shen', 酉: 'You', 戌: 'Xu', 亥: 'Hai',
};
function shichenLabelEn(label: string, branch: string): string {
  const range = label.match(/\(([^)]+)\)/)?.[1] ?? '';
  return `${range} · ${SHICHEN_PINYIN[branch] ?? branch} hour (${branch})`;
}

type DateFieldKey = 'year' | 'month' | 'day';

export function BirthDateInput({ value, onChange }: Props) {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState<Record<DateFieldKey, string>>({
    year: value.year ? String(value.year) : '',
    month: value.month ? String(value.month) : '',
    day: value.day ? String(value.day) : '',
  });

  // 若外部（例如重置表單）改動了 value，同步 draft，但不要蓋掉使用者正在輸入的內容
  useEffect(() => {
    setDraft({
      year: value.year ? String(value.year) : '',
      month: value.month ? String(value.month) : '',
      day: value.day ? String(value.day) : '',
    });
  }, [value.year, value.month, value.day]);

  const handleFieldChange = (key: DateFieldKey, raw: string) => {
    setDraft((prevDraft) => ({ ...prevDraft, [key]: raw }));
    if (raw === '') return;
    const num = Number(raw);
    if (!Number.isNaN(num)) onChange({ ...value, [key]: num });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {dateFields.map(({ label, key, min, max }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className={labelClass}>{t(label)}</span>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={draft[key]}
              onChange={(event) => handleFieldChange(key, event.target.value)}
              className={fieldClass}
            />
          </label>
        ))}
      </div>

      <p className="text-[#636363] text-xs">{t('form.solarHint')}</p>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t('form.hour')}</span>
        <select
          value={value.hour ?? ''}
          onChange={(event) =>
            onChange({ ...value, hour: event.target.value === '' ? null : Number(event.target.value) })
          }
          className={selectClass}
        >
          <option value="">{t('form.hourUnknown')}</option>
          {SHICHEN.map((shichen) => (
            <option key={shichen.branch} value={shichen.hours[0]}>
              {locale === 'en' ? shichenLabelEn(shichen.label, shichen.branch) : shichen.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
