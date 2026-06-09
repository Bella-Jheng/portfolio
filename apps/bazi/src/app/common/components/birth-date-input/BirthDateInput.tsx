'use client';

import { SHICHEN } from '../../../types/bazi';

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

const dateFields = [
  { label: '年', key: 'year' as const, min: 1900, max: 2100 },
  { label: '月', key: 'month' as const, min: 1, max: 12 },
  { label: '日', key: 'day' as const, min: 1, max: 31 },
];

export function BirthDateInput({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {dateFields.map(({ label, key, min, max }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className={labelClass}>{label}</span>
            <input
              type="number"
              min={min}
              max={max}
              value={value[key]}
              onChange={(event) =>
                onChange({ ...value, [key]: event.target.value === '' ? 0 : Number(event.target.value) })
              }
              className={fieldClass}
            />
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>出生時辰（選填）</span>
        <select
          value={value.hour ?? ''}
          onChange={(event) =>
            onChange({ ...value, hour: event.target.value === '' ? null : Number(event.target.value) })
          }
          className={selectClass}
        >
          <option value="">不知道時辰</option>
          {SHICHEN.map((shichen) => (
            <option key={shichen.branch} value={shichen.hours[0]}>
              {shichen.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
