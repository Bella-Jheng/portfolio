'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import clsx from 'clsx';
import { useHydrated, useListings } from '../../../../lib/store';
import { TEMPLATES } from '../../../../lib/templates';
import { copyText, lineHref, lineIsPhone, telHref } from '../../../../lib/contact';
import type { Listing } from '../../../../lib/types';
import { BackIcon, CopyIcon } from '../../../../components/icons';

export default function MessagePage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const listing = useListings((s) => s.listings.find((l) => l.id === id));

  if (!hydrated) return null;
  if (!listing) {
    return (
      <div className="flex flex-col items-center gap-3 px-8 pt-24 text-center">
        <p className="text-base font-medium">找不到這間物件</p>
        <Link href="/" className="btn-outline">
          回首頁
        </Link>
      </div>
    );
  }
  return <Composer listing={listing} />;
}

function Composer({ listing: l }: { listing: Listing }) {
  const setStatus = useListings((s) => s.setStatus);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [text, setText] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  useEffect(() => {
    setText(template.build(l));
    // 只在換範本時重建；使用者正在改的字不要被蓋掉
  }, [templateId]);

  const say = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2500);
  };

  const copy = async () => say((await copyText(text)) ? '已複製訊息' : '複製失敗，請長按文字手動複製');

  const lineId = l.lineIds[0];
  const phone = l.phones[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-1 px-3 pb-1 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href={`/listing/${l.id}`} aria-label="返回" className="flex h-11 w-11 shrink-0 items-center justify-center">
          <BackIcon size={22} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">私訊代管</h1>
          <p className="truncate text-[13px] text-sub">
            {[l.title, l.contactName].filter(Boolean).join(' · ') || '未命名物件'}
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3.5 px-4 pb-48 pt-3">
        <section className="flex flex-col gap-2">
          <h2 className="mx-1 text-[15px] font-bold">選擇範本</h2>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={t.id === templateId}
                onClick={() => setTemplateId(t.id)}
                className={clsx(
                  'h-10 rounded-full px-4 text-sm',
                  t.id === templateId ? 'bg-ink text-white' : 'border border-line bg-white',
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>

        <section className="card flex flex-col gap-2.5 p-4">
          <label htmlFor="message" className="text-[15px] font-bold">
            訊息（可以直接改）
          </label>
          <textarea
            id="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl bg-ground p-3.5 text-[15px] leading-7 outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-xs text-sub">聯絡人、租金、物件編號會自動帶入；[ ] 裡的字記得換掉。</p>
        </section>
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto flex max-w-[480px] flex-col gap-2.5 border-t border-[#E3E8EE] bg-ground px-5 pt-3.5">
        {flash && (
          <p role="status" className="text-center text-sm text-brand">
            {flash}
          </p>
        )}
        <button type="button" onClick={copy} className="btn-primary h-14 w-full rounded-2xl text-base font-bold">
          <CopyIcon size={20} />
          複製訊息
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          {lineId ? (
            <a
              href={lineHref(lineId)}
              target="_blank"
              rel="noreferrer"
              onClick={async () => {
                const ok = await copyText(lineIsPhone(lineId) ? lineId : text);
                if (ok) say(lineIsPhone(lineId) ? `已複製號碼 ${lineId}，到 LINE 搜尋加好友` : '已複製訊息，到 LINE 貼上');
              }}
              className="btn-outline h-12 rounded-[14px]"
            >
              複製並開 LINE
            </a>
          ) : phone ? (
            <a href={telHref(phone)} className="btn-outline h-12 rounded-[14px]">
              撥打 {phone}
            </a>
          ) : (
            <Link href={`/listing/${l.id}`} className="btn-outline h-12 rounded-[14px]">
              補聯絡方式
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setStatus(l.id, 'contacting');
              say('已標記為聯絡中');
            }}
            className="btn-outline h-12 rounded-[14px]"
          >
            標記聯絡中
          </button>
        </div>
      </div>
    </div>
  );
}
