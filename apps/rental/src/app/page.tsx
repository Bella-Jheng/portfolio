'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useListings, useHydrated } from '../lib/store';
import { STATUSES, type Status } from '../lib/types';
import { FilterChips } from '../components/FilterChips';
import { ListView } from '../components/ListView';
import { MapView } from '../components/MapView';

// 地圖／清單由網址決定（底部導覽列的「地圖」連到 /，「清單」連到 /?view=list）
type View = 'map' | 'list';

export default function HomePage() {
  // useSearchParams 需要包在 Suspense 裡
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const listings = useListings((s) => s.listings);
  const view: View = searchParams.get('view') === 'list' ? 'list' : 'map';
  const [active, setActive] = useState<Set<Status>>(() => new Set(STATUSES));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggle = (s: Status) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const filtered = useMemo(() => listings.filter((l) => active.has(l.status)), [listings, active]);

  return (
    <div className="relative h-dvh overflow-hidden">
      {view === 'map' ? (
        <div className="absolute inset-x-0 top-0 bottom-[var(--nav-h)]">
          {hydrated && <MapView listings={filtered} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>
      ) : (
        <div className="absolute inset-x-0 top-0 bottom-[var(--nav-h)] overflow-y-auto pt-[136px]">
          {hydrated && <ListView listings={filtered} total={listings.length} />}
        </div>
      )}

      <header
        className={`absolute inset-x-0 top-0 flex flex-col gap-2.5 px-4 pb-2 pt-[max(16px,env(safe-area-inset-top))] ${
          view === 'list' ? 'bg-ground' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex h-11 flex-1 items-center rounded-full px-4 ${
              view === 'map' ? 'bg-white shadow-[0_2px_8px_rgba(58,42,32,.12)]' : ''
            }`}
          >
            <h1 className="text-lg font-bold">租屋小幫手</h1>
            <span className="ml-2 text-sm text-sub">{hydrated ? `${listings.length} 間` : ''}</span>
          </div>
        </div>
        <FilterChips listings={listings} active={active} onToggle={toggle} floating={view === 'map'} />
      </header>

    </div>
  );
}
