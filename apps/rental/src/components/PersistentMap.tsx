'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { useHydrated, useListings } from '../lib/store';
import { useMapUi } from '../lib/map-ui';
import { MapView } from './MapView';

/** 首頁的地圖檢視：網址是 / 而且不是 ?view=list、?view=favorites */
export function isMapView(pathname: string, view: string | null): boolean {
  return pathname === '/' && view !== 'list' && view !== 'favorites';
}

/**
 * Google 地圖是「每建立一次地圖就算一次載入」計費，所以地圖掛在 layout 上，不跟著頁面換掉：
 * - 第一次進到地圖檢視才建立（只看清單、設定的人不會產生費用）
 * - 之後切到清單或其他頁面只是藏起來（visibility: hidden，保留尺寸，回來不用重排），不會重建
 */
export function PersistentMap() {
  // useSearchParams 需要包在 Suspense 裡
  return (
    <Suspense>
      <MapHost />
    </Suspense>
  );
}

function MapHost() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visible = isMapView(pathname, searchParams.get('view'));
  const hydrated = useHydrated();

  // 只要出現過一次就保持掛載；在 render 中更新是 React 允許的「依 props 調整 state」寫法
  const [everShown, setEverShown] = useState(visible);
  if (visible && !everShown) setEverShown(true);

  const listings = useListings((s) => s.listings);
  const active = useMapUi((s) => s.active);
  const selectedId = useMapUi((s) => s.selectedId);
  const setSelected = useMapUi((s) => s.setSelected);
  const filtered = useMemo(() => listings.filter((l) => active.includes(l.status)), [listings, active]);

  if (!everShown || !hydrated) return null;

  return (
    <div
      aria-hidden={!visible}
      className={clsx(
        'fixed inset-x-0 top-0 bottom-[var(--nav-h)] mx-auto max-w-[480px]',
        !visible && 'invisible pointer-events-none',
      )}
    >
      <MapView listings={filtered} selectedId={selectedId} onSelect={setSelected} />
    </div>
  );
}
