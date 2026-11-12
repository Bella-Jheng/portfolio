'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { STATUS_META, type Listing } from '../lib/types';
import { formatRent, mapsDirectionsHref } from '../lib/contact';
import { MAPS_KEY, MAP_ID } from './Providers';
import { StatusChip } from './StatusChip';
import { HeartIcon, ImageIcon, NoteIcon } from './icons';

const TAICHUNG = { lat: 24.1477, lng: 120.6736 };

export function MapView({
  listings,
  selectedId,
  onSelect,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (!MAPS_KEY) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm leading-relaxed text-sub">
        還沒設定 Google Maps API key，地圖先關閉。
        <br />
        在環境變數加上 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 就會出現。
      </div>
    );
  }

  const located = listings.filter((l) => l.lat != null && l.lng != null);
  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full">
      <Map
        mapId={MAP_ID}
        defaultCenter={TAICHUNG}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        onClick={() => onSelect(null)}
        className="h-full w-full"
      >
        <FitBounds listings={located} />
        {located.map((l) => {
          const meta = STATUS_META[l.status];
          const isSelected = l.id === selectedId;
          return (
            <AdvancedMarker
              key={l.id}
              position={{ lat: l.lat as number, lng: l.lng as number }}
              zIndex={isSelected ? 1000 : l.status === 'favorite' ? 500 : l.status === 'rented' ? 1 : 100}
              onClick={() => onSelect(l.id)}
              title={`${meta.label}：${l.title || l.address}`}
            >
              <div className="flex flex-col items-center">
                <span
                  className="flex items-center gap-1 rounded-full font-bold text-white"
                  style={{
                    background: meta.color,
                    padding: isSelected ? '7px 13px' : '5px 10px',
                    fontSize: isSelected ? 15 : 13,
                    boxShadow: isSelected
                      ? '0 0 0 3px #fff, 0 4px 12px rgba(58,42,32,.3)'
                      : '0 2px 6px rgba(58,42,32,.25)',
                  }}
                >
                  {l.status === 'favorite' && <HeartIcon />}
                  {formatRent(l.rent)}
                </span>
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `7px solid ${meta.color}`,
                  }}
                />
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {selected && <SelectedCard listing={selected} />}
      {located.length < listings.length && !selected && (
        <p className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 px-3 py-2 text-xs text-sub shadow">
          有 {listings.length - located.length} 間還沒定位（地址不完整），可以到清單裡補地址。
        </p>
      )}
    </div>
  );
}

/** 第一次有資料時，把所有標記框進畫面 */
function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!map || done.current || listings.length === 0) return;
    done.current = true;
    if (listings.length === 1) {
      map.setCenter({ lat: listings[0].lat as number, lng: listings[0].lng as number });
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    listings.forEach((l) => bounds.extend({ lat: l.lat as number, lng: l.lng as number }));
    map.fitBounds(bounds, { top: 140, bottom: 200, left: 40, right: 40 });
  }, [map, listings]);
  return null;
}

function SelectedCard({ listing: l }: { listing: Listing }) {
  const latest = l.notes[0];
  return (
    <article className="card absolute bottom-3 left-3 right-3 flex flex-col gap-3 p-3.5 shadow-[0_6px_20px_rgba(58,42,32,.2)]">
      <Link href={`/listing/${l.id}`} className="flex gap-3">
        <Thumb listing={l} size={72} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <StatusChip status={l.status} />
          <h2 className="truncate text-base font-bold">{l.title || '（未命名物件）'}</h2>
          <p className="truncate text-sm text-sub">
            <b className="text-base text-ink">{formatRent(l.rent)}</b>
            {[l.size, l.pets].filter(Boolean).map((t) => ` · ${t}`)}
          </p>
        </div>
      </Link>
      {latest && (
        <p className="flex items-center gap-1.5 truncate rounded-lg bg-white px-2.5 py-2 text-[13px] text-[#5C4A3D]">
          <NoteIcon size={14} className="shrink-0" />
          <span className="truncate">{latest.text}</span>
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Link href={`/listing/${l.id}`} className="btn-outline">
          詳細
        </Link>
        <a href={mapsDirectionsHref(l.address, l.lat, l.lng)} target="_blank" rel="noreferrer" className="btn-outline">
          導航
        </a>
        <Link href={`/listing/${l.id}/message`} className="btn-primary">
          私訊
        </Link>
      </div>
    </article>
  );
}

export function Thumb({ listing, size }: { listing: Listing; size: number }) {
  // 有首圖就用房子照片，沒有才用截圖
  const src = listing.coverImage ?? listing.thumbnail;
  return src ? (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-xl object-cover ${listing.coverImage ? 'object-center' : 'object-top'}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-[#EFE4D6] text-sub"
      style={{ width: size, height: size }}
    >
      <ImageIcon size={22} />
    </div>
  );
}
