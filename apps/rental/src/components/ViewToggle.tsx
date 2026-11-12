'use client';

import clsx from 'clsx';

export type View = 'map' | 'list';

export function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div
      role="group"
      aria-label="切換檢視"
      className="flex h-11 shrink-0 rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(23,32,43,.12)]"
    >
      {(['map', 'list'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => onChange(v)}
          className={clsx(
            'rounded-full px-3.5 text-sm',
            view === v ? 'bg-ink text-white' : 'text-ink',
          )}
        >
          {v === 'map' ? '地圖' : '清單'}
        </button>
      ))}
    </div>
  );
}
