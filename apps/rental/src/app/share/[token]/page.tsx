'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatRent, formatViewing, mapsSearchHref } from '../../../lib/contact';
import { SOURCE_LABEL } from '../../../lib/types';
import type { PublicListing } from '../../../lib/data/access';
import { ExternalIcon, PinIcon } from '../../../components/icons';

/** 分享連結頁：不用登入就能看一間物件（只能看，沒有備註） */
export default function SharedListingPage() {
  const { token } = useParams<{ token: string }>();
  const [listing, setListing] = useState<PublicListing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as { listing?: PublicListing; error?: string };
        if (!res.ok || !data.listing) throw new Error(data.error ?? '這個分享連結已失效');
        setListing(data.listing);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '這個分享連結已失效'));
  }, [token]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 pt-24 text-center">
        <p className="text-base font-medium">{error}</p>
        <p className="text-sm text-sub">請跟分享給你的人要新的連結。</p>
      </div>
    );
  }
  if (!listing) return <p className="px-8 pt-24 text-center text-sm text-sub">載入中…</p>;

  const l = listing;
  const rows: [string, string][] = [
    ['租金（每月）', formatRent(l.rent)],
    ['地址', l.address],
    ['房型', l.layout],
    ['坪數', l.size],
    ['樓層', l.floor],
    ['費用與條件', l.fees],
    ['寵物', l.pets],
    ['物件編號', l.listingNo],
    ['聯絡人', [l.contactName, l.contactRole].filter(Boolean).join(' · ')],
    ['電話', l.phones.join('、')],
    ['LINE', l.lineIds.join('、')],
    ['IG', l.igIds.join('、')],
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pb-2 pt-[max(20px,env(safe-area-inset-top))]">
        <p className="text-xs text-sub">租屋小幫手 · 分享的物件</p>
        <h1 className="text-xl font-bold">{l.title || '物件資訊'}</h1>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 pb-10 pt-1">
        {(l.coverImage || l.thumbnail) && (
          <img
            src={l.coverImage ?? l.thumbnail}
            alt="房子照片"
            className="aspect-[4/3] w-full rounded-2xl border border-line object-cover"
          />
        )}
        {l.viewingAt && (
          <p className="rounded-xl border border-line px-3 py-2 text-sm">預約看房：{formatViewing(l.viewingAt)}</p>
        )}
        <section className="card flex flex-col px-3.5 py-1">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex flex-col gap-px border-b border-[#F2F2F2] py-2.5 last:border-b-0">
                <span className="text-xs text-sub">{label}</span>
                <span className="break-words text-[15px]">{value}</span>
              </div>
            ))}
        </section>
        <div className="flex flex-wrap gap-2">
          {l.sourceUrl && (
            <a href={l.sourceUrl} target="_blank" rel="noreferrer" className="btn-outline">
              看 {SOURCE_LABEL[l.source]} 原始貼文
              <ExternalIcon size={15} />
            </a>
          )}
          <a href={mapsSearchHref(l.address, l.lat, l.lng)} target="_blank" rel="noreferrer" className="btn-outline">
            <PinIcon size={16} />
            在 Google Maps 開啟
          </a>
        </div>
      </main>
    </div>
  );
}
