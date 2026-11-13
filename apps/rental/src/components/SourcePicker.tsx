'use client';

import clsx from 'clsx';
import { SOURCE_LABEL, type Source } from '../lib/types';

/** 房源來源（591／FB 社團／IG／其他）的單選標籤 */
export function SourcePicker({ value, onChange }: { value: Source; onChange: (source: Source) => void }) {
  return (
    <div role="radiogroup" aria-label="來源" className="flex flex-wrap gap-2">
      {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={clsx(
            'h-9 rounded-full px-3.5 text-sm',
            value === s ? 'bg-ink text-white' : 'border border-line bg-white',
          )}
        >
          {SOURCE_LABEL[s]}
        </button>
      ))}
    </div>
  );
}
