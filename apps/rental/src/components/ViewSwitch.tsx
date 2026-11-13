'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export type View = 'map' | 'list';

/** 首頁標題右邊的地圖／清單切換；用網址記住目前在哪一個（/、/?view=list） */
export function ViewSwitch({ view }: { view: View }) {
  const router = useRouter();
  return (
    <div
      role="group"
      aria-label="切換地圖或清單"
      className="flex h-11 shrink-0 rounded-full border border-card-line bg-white p-1 shadow-[0_2px_8px_rgba(46,48,51,.12)]"
    >
      {(['map', 'list'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => router.replace(v === 'map' ? '/' : '/?view=list')}
          className={clsx('rounded-full px-3.5 text-sm', view === v ? 'bg-ink text-white' : 'text-ink')}
        >
          {v === 'map' ? '地圖' : '清單'}
        </button>
      ))}
    </div>
  );
}
