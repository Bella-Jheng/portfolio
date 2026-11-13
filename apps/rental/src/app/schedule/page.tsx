'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useHydrated, useListings } from '../../lib/store';
import { formatRent, formatViewing } from '../../lib/contact';
import type { Listing } from '../../lib/types';
import { BackIcon, CalendarIcon } from '../../components/icons';
import { StatusChip } from '../../components/StatusChip';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/** 當地日期的 key，例如 2026-11-15（用手機的時區，不是 UTC） */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** 這個月的格子：從第一週的星期日開始，補滿整週 */
function monthCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const last = new Date(year, month + 1, 0);
  const total = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
  return Array.from({ length: total }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export default function SchedulePage() {
  const hydrated = useHydrated();
  const listings = useListings((s) => s.listings);
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(dayKey(today));

  // 有預約看房的物件，依日期分組、時間排序
  const byDay = useMemo(() => {
    const map = new Map<string, Listing[]>();
    listings
      .filter((l) => l.viewingAt)
      .sort((a, b) => (a.viewingAt as string).localeCompare(b.viewingAt as string))
      .forEach((l) => {
        const key = dayKey(new Date(l.viewingAt as string));
        map.set(key, [...(map.get(key) ?? []), l]);
      });
    return map;
  }, [listings]);

  const upcoming = useMemo(
    () =>
      listings
        .filter((l) => l.viewingAt && new Date(l.viewingAt).getTime() >= Date.now() - 60 * 60 * 1000)
        .sort((a, b) => (a.viewingAt as string).localeCompare(b.viewingAt as string)),
    [listings],
  );

  const cells = monthCells(cursor.year, cursor.month);
  const moveMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const selectedItems = byDay.get(selected) ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pb-2 pt-[max(20px,env(safe-area-inset-top))]">
        <h1 className="text-xl font-bold">行程管理</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-[calc(var(--nav-h)+24px)] pt-2">
        <section aria-label="月曆" className="card p-3">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="上個月" onClick={() => moveMonth(-1)} className="flex h-10 w-10 items-center justify-center">
              <BackIcon size={20} />
            </button>
            <p className="text-[15px] font-bold">
              {cursor.year} 年 {cursor.month + 1} 月
            </p>
            <button type="button" aria-label="下個月" onClick={() => moveMonth(1)} className="flex h-10 w-10 items-center justify-center">
              <BackIcon size={20} className="rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-sub">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d) => {
              const key = dayKey(d);
              const count = hydrated ? (byDay.get(key)?.length ?? 0) : 0;
              const inMonth = d.getMonth() === cursor.month;
              const isToday = key === dayKey(today);
              const isSelected = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日${count ? `，${count} 個看房行程` : ''}`}
                  onClick={() => setSelected(key)}
                  className="flex h-12 flex-col items-center justify-center gap-0.5"
                >
                  <span
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm',
                      isSelected ? 'bg-ink text-white' : isToday ? 'font-bold text-brand' : inMonth ? 'text-ink' : 'text-sub/50',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className={clsx('h-1.5 w-1.5 rounded-full', count ? 'bg-brand' : 'bg-transparent')} />
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="當天行程" className="flex flex-col gap-2">
          <h2 className="mx-1 text-[15px] font-bold">
            {(() => {
              const [y, m, d] = selected.split('-').map(Number);
              return `${m}/${d}（${WEEKDAYS[new Date(y, m - 1, d).getDay()]}）`;
            })()}
          </h2>
          {selectedItems.length === 0 ? (
            <p className="mx-1 text-sm text-sub">這天沒有看房行程</p>
          ) : (
            selectedItems.map((l) => <ViewingItem key={l.id} listing={l} />)
          )}
        </section>

        <section aria-label="接下來的行程" className="flex flex-col gap-2">
          <h2 className="mx-1 text-[15px] font-bold">接下來的看房</h2>
          {!hydrated ? null : upcoming.length === 0 ? (
            <p className="mx-1 text-sm leading-relaxed text-sub">
              還沒有預約。在物件頁的「預約看房」填上時間，就會出現在這裡和月曆上。
            </p>
          ) : (
            upcoming.map((l) => <ViewingItem key={l.id} listing={l} showDate />)
          )}
        </section>
      </main>
    </div>
  );
}

function ViewingItem({ listing: l, showDate = false }: { listing: Listing; showDate?: boolean }) {
  const time = new Date(l.viewingAt as string);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <Link href={`/listing/${l.id}`} className="card flex items-center gap-3 p-3">
      <span className="flex w-14 shrink-0 flex-col items-center text-brand">
        <CalendarIcon size={18} />
        <span className="text-sm font-bold">{showDate ? formatViewing(l.viewingAt as string).split('（')[0] : ''}</span>
        <span className="text-xs">{`${pad(time.getHours())}:${pad(time.getMinutes())}`}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-bold">{l.title || '（未命名物件）'}</span>
        <span className="truncate text-[13px] text-sub">{l.address || '地址未填'}</span>
        <span className="flex items-center gap-2 text-[13px]">
          <StatusChip status={l.status} />
          <span className="font-medium">{formatRent(l.rent)}</span>
        </span>
      </span>
    </Link>
  );
}
