'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useListings, useHydrated } from '../lib/store';
import { STATUSES, type Status } from '../lib/types';
import { FilterChips } from '../components/FilterChips';
import { ListView } from '../components/ListView';
import { MapView } from '../components/MapView';
import { ViewToggle, type View } from '../components/ViewToggle';
import { PlusIcon } from '../components/icons';

const VIEW_KEY = 'rental-helper:view';

export default function HomePage() {
  const hydrated = useHydrated();
  const listings = useListings((s) => s.listings);
  const [view, setView] = useState<View>('map');
  const [active, setActive] = useState<Set<Status>>(() => new Set(STATUSES));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(VIEW_KEY);
      if (saved === 'map' || saved === 'list') setView(saved);
    } catch {
      /* 無痕模式之類的讀不到就算了 */
    }
  }, []);

  const changeView = (v: View) => {
    setView(v);
    try {
      sessionStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

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
        <div className="absolute inset-0">
          {hydrated && <MapView listings={filtered} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto pt-[136px]">
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
              view === 'map' ? 'bg-white shadow-[0_2px_8px_rgba(23,32,43,.12)]' : ''
            }`}
          >
            <h1 className="text-lg font-bold">租屋小幫手</h1>
            <span className="ml-2 text-sm text-sub">{hydrated ? `${listings.length} 間` : ''}</span>
          </div>
          <ViewToggle view={view} onChange={changeView} />
        </div>
        <FilterChips listings={listings} active={active} onToggle={toggle} floating={view === 'map'} />
      </header>

      {!(view === 'map' && selectedId) && (
        <Link
          href="/add"
          aria-label="新增房間"
          className="absolute bottom-[max(28px,env(safe-area-inset-bottom))] right-5 flex items-center justify-center rounded-full bg-ink text-white shadow-[0_6px_16px_rgba(23,32,43,.35)]"
          style={{ width: 60, height: 60 }}
        >
          <PlusIcon size={28} strokeWidth={2.4} />
        </Link>
      )}
    </div>
  );
}
