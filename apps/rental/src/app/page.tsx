'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useListings, useHydrated } from '../lib/store';
import { STATUSES, type Status } from '../lib/types';
import { FilterChips } from '../components/FilterChips';
import { ListView } from '../components/ListView';
import { MapView } from '../components/MapView';
import { ViewSwitch, type View } from '../components/ViewSwitch';

// 地圖／清單由網址決定（/、/?view=list，標題右邊的切換）；「最想要」是 /?view=favorites

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
  const viewParam = searchParams.get('view');
  // 「最想要」是只列出最想要物件的清單，不顯示狀態篩選
  const favoritesOnly = viewParam === 'favorites';
  const view: View = viewParam === 'list' || favoritesOnly ? 'list' : 'map';
  const [active, setActive] = useState<Set<Status>>(() => new Set(STATUSES));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggle = (s: Status) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const filtered = useMemo(
    () => listings.filter((l) => (favoritesOnly ? l.favorite : active.has(l.status))),
    [listings, active, favoritesOnly],
  );

  return (
    <div className="relative h-dvh overflow-hidden">
      {view === 'map' ? (
        <div className="absolute inset-x-0 top-0 bottom-[var(--nav-h)]">
          {hydrated && <MapView listings={filtered} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>
      ) : (
        <div className={`absolute inset-0 overflow-y-auto pb-[var(--nav-h)] ${favoritesOnly ? 'pt-[84px]' : 'pt-[136px]'}`}>
          {hydrated && (
            <ListView
              listings={filtered}
              total={listings.length}
              emptyText={
                favoritesOnly ? '還沒有「最想要」的物件。按物件右上角的愛心，就會出現在這裡。' : undefined
              }
            />
          )}
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
              view === 'map' ? 'bg-white shadow-[0_2px_8px_rgba(46,48,51,.12)]' : ''
            }`}
          >
            <h1 className="text-lg font-bold">{favoritesOnly ? '最想要' : '租屋小幫手'}</h1>
            <span className="ml-2 text-sm text-sub">{hydrated ? `${favoritesOnly ? filtered.length : listings.length} 間` : ''}</span>
          </div>
          {!favoritesOnly && <ViewSwitch view={view} />}
        </div>
        {!favoritesOnly && (
          <FilterChips listings={listings} active={active} onToggle={toggle} floating={view === 'map'} />
        )}
      </header>

    </div>
  );
}
