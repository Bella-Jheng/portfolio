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
              'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] transition-opacity',
              floating ? 'bg-cream shadow-[0_1px_4px_rgba(58,42,32,.15)]' : 'bg-cream',
              !on && 'opacity-45',
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
