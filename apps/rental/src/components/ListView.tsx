'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { Listing } from '../lib/types';
import { formatRent, mapsSearchHref } from '../lib/contact';
import { StatusChip } from './StatusChip';
import { Thumb } from './MapView';
import { ChatIcon, NoteIcon, PinIcon } from './icons';

export function ListView({ listings, total }: { listings: Listing[]; total: number }) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 pt-24 text-center text-sub">
        <p className="text-base font-medium text-ink">還沒有物件</p>
        <p className="text-sm">按右下角的 + 上傳租屋截圖，AI 會幫你整理好。</p>
      </div>
    );
  }
  if (listings.length === 0) {
    return <p className="px-8 pt-16 text-center text-sm text-sub">這個篩選條件下沒有物件</p>;
  }

  return (
    <ul className="flex flex-col gap-3 px-4 pb-32">
      {listings.map((l) => {
        const rented = l.status === 'rented';
        const latest = l.notes[0];
        return (
          <li key={l.id}>
            <article
              className={clsx(
                'flex flex-col gap-3 rounded-2xl p-3.5',
                rented ? 'border border-[#E3E8EE] bg-[#F9FAFB]' : 'bg-white',
              )}
            >
              <Link href={`/listing/${l.id}`} className="flex gap-3">
                <Thumb listing={l} size={84} />
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className={clsx('truncate text-base font-bold', rented && 'text-sub')}>
                    {l.title || '（未命名物件）'}
                  </h2>
                  <p className="truncate text-[13px] text-sub">{l.address || '地址未填'}</p>
                  <p className={clsx('text-lg font-bold', rented && 'text-sub line-through')}>
                    {formatRent(l.rent)}
                    {l.size && <span className="text-[13px] font-normal text-sub"> / 月 · {l.size}</span>}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusChip status={l.status} />
                    {l.pets && (
                      <span className="rounded-full bg-[#EEF1F4] px-2.5 py-0.5 text-xs text-[#3D4652]">{l.pets}</span>
                    )}
                    {l.uncertain.length > 0 && (
                      <span className="rounded-full bg-warn-bg px-2.5 py-0.5 text-xs text-warn-text">待確認</span>
                    )}
                  </div>
                </div>
              </Link>
              {latest && (
                <p className="flex items-center gap-1.5 rounded-lg bg-ground px-2.5 py-2 text-[13px] text-[#3D4652]">
                  <NoteIcon size={14} className="shrink-0" />
                  <span className="truncate">{latest.text}</span>
                </p>
              )}
              {!rented && (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={mapsSearchHref(l.address, l.lat, l.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline"
                  >
                    <PinIcon size={18} />
                    地圖
                  </a>
                  <Link href={`/listing/${l.id}#message`} className="btn-primary">
                    <ChatIcon size={18} />
                    私訊代管
                  </Link>
                </div>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
