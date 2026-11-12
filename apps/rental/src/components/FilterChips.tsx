'use client';

import clsx from 'clsx';
import { STATUSES, STATUS_META, type Listing, type Status } from '../lib/types';
import { StatusDot } from './StatusChip';

export function FilterChips({
  listings,
  active,
  onToggle,
  floating = false,
}: {
  listings: Listing[];
  active: Set<Status>;
  onToggle: (s: Status) => void;
  floating?: boolean;
}) {
  return (
    <div role="group" aria-label="依狀態篩選" className="flex gap-1.5 overflow-x-auto">
      {STATUSES.map((s) => {
        const on = active.has(s);
        const count = listings.filter((l) => l.status === s).length;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(s)}
            className={clsx(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition',
              // 選中的狀態用奶油色突出，沒選的是白色
              on ? 'border-[#DDD6CA] bg-cream' : 'border-line bg-white opacity-50',
              floating && 'shadow-[0_1px_4px_rgba(46,48,51,.15)]',
            )}
          >
            <StatusDot status={s} />
            {STATUS_META[s].label} {count}
          </button>
        );
      })}
    </div>
  );
}
