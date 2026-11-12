'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useHydrated, useListings } from '../../../lib/store';
import { useGeocode } from '../../../lib/geocode';
import { STATUSES, STATUS_META, type Listing, type ParsedField } from '../../../lib/types';
import { copyText, igHandle, igHref, lineHref, lineIsPhone, mapsSearchHref, telHref } from '../../../lib/contact';
import { resizeCoverImage } from '../../../lib/image';
import { PROFILE_TEMPLATE_ID, TEMPLATES, buildMessage } from '../../../lib/templates';
import { usePreferences } from '../../../lib/preferences';
import { EditableRow } from '../../../components/EditableRow';
import { MAPS_KEY } from '../../../components/Providers';
import {
  BackIcon,
  ChatIcon,
  CopyIcon,
  ExternalIcon,
  ImageIcon,
  InstagramIcon,
  LineIcon,
  NoteIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
} from '../../../components/icons';

export default function ListingPage() {
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
  return <ListingDetail listing={listing} />;
}

function ListingDetail({ listing: l }: { listing: Listing }) {
  const router = useRouter();
  const { update, setStatus, remove } = useListings();
  const geocode = useGeocode();
  const [locating, setLocating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isUncertain = (f: ParsedField) => l.uncertain.includes(f);
  const save = (field: ParsedField, patch: Partial<Listing>) => update(l.id, patch, [field]);
  // 內容沒問題、不用改：只把 AI 不確定的標記拿掉
  const confirm = (field: ParsedField) => update(l.id, {}, [field]);

  const saveAddress = async (address: string) => {
    save('address', { address, lat: undefined, lng: undefined });
    setLocating(true);
    const loc = await geocode(address);
    setLocating(false);
    if (loc) update(l.id, loc);
  };

  // 沒設定 Maps key 時本來就不會定位，不要把每個地址都標成黃色
  const located = !MAPS_KEY || (l.lat != null && l.lng != null);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-1 px-3 pb-1 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href="/" aria-label="返回" className="flex h-11 w-11 items-center justify-center">
          <BackIcon size={22} />
        </Link>
        <h1 className="truncate text-xl font-bold">{l.title || '物件資訊'}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 pb-[calc(var(--nav-h)+24px)] pt-1">
        {l.uncertain.length > 0 && (
          <div className="mx-1 flex items-start justify-between gap-3 text-[13px] text-sub">
            <p>
              <span className="font-medium text-warn-text">黃色欄位</span>是 AI 沒把握的：內容正確就按「沒問題」，不對就按鉛筆修改。
            </p>
            <button
              type="button"
              onClick={() => update(l.id, {}, l.uncertain)}
              className="shrink-0 font-medium text-brand underline"
            >
              全部沒問題
            </button>
          </div>
        )}

        <CoverSection listing={l} />

        {/* 狀態 */}
        <section aria-label="狀態" className="grid grid-cols-5 gap-1">
          {STATUSES.map((s) => {
            const meta = STATUS_META[s];
            const on = l.status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStatus(l.id, s)}
                className="h-10 rounded-full px-0.5 text-[13px] font-medium transition-colors"
                style={
                  on
                    ? { background: meta.color, color: '#fff' }
                    : { background: '#FFFFFF', color: meta.softText, border: '1px solid #E4E0D8' }
                }
              >
                {meta.label}
              </button>
            );
          })}
        </section>

        {/* 物件資訊 */}
        <section className="card flex flex-col px-3.5 py-1">
          <EditableRow label="標題" value={l.title} uncertain={isUncertain('title')} onConfirm={() => confirm('title')} onSave={(v) => save('title', { title: v })} />
          <EditableRow
            label="租金（每月）"
            value={l.rent != null ? String(l.rent) : ''}
            inputMode="numeric"
            uncertain={isUncertain('rent')} onConfirm={() => confirm('rent')}
            onSave={(v) => {
              const n = parseInt(v.replace(/[^\d]/g, ''), 10);
              save('rent', { rent: Number.isFinite(n) ? n : undefined });
            }}
          />
          <EditableRow
            label="地址"
            value={l.address}
            uncertain={isUncertain('address') || (!located && !!l.address)}
            uncertainHint={!located && l.address ? (locating ? '定位中…' : '地圖上找不到，請補完整') : '只有大概位置'}
            // 「地圖上找不到」要補地址才能解決，只有 AI 沒把握時才能按沒問題
            onConfirm={isUncertain('address') ? () => confirm('address') : undefined}
            onSave={saveAddress}
          />
          <EditableRow label="房型" value={l.layout} uncertain={isUncertain('layout')} onConfirm={() => confirm('layout')} onSave={(v) => save('layout', { layout: v })} />
          <EditableRow label="坪數" value={l.size} uncertain={isUncertain('size')} onConfirm={() => confirm('size')} onSave={(v) => save('size', { size: v })} />
          <EditableRow label="樓層" value={l.floor} uncertain={isUncertain('floor')} onConfirm={() => confirm('floor')} onSave={(v) => save('floor', { floor: v })} />
          <EditableRow label="費用與條件" value={l.fees} uncertain={isUncertain('fees')} onConfirm={() => confirm('fees')} onSave={(v) => save('fees', { fees: v })} />
          <EditableRow label="寵物" value={l.pets} uncertain={isUncertain('pets')} onConfirm={() => confirm('pets')} onSave={(v) => save('pets', { pets: v })} />
          <EditableRow
            label="物件編號"
            value={l.listingNo}
            uncertain={isUncertain('listingNo')} onConfirm={() => confirm('listingNo')}
            uncertainHint="截圖裡沒找到"
            onSave={(v) => save('listingNo', { listingNo: v })}
          />
        </section>

        <ContactSection listing={l} />
        <MessageSection listing={l} />
        <NotesSection listing={l} />

        <a
          href={mapsSearchHref(l.address, l.lat, l.lng)}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-1.5 text-sm font-medium text-brand"
        >
          在 Google Maps 開啟
          <ExternalIcon size={15} />
        </a>

        <div className="flex justify-center">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span>確定刪除這間？</span>
              <button
                type="button"
                className="btn h-9 bg-[#B42318] text-white"
                onClick={() => {
                  remove(l.id);
                  router.replace('/');
                }}
              >
                刪除
              </button>
              <button type="button" className="btn-outline h-9" onClick={() => setConfirmDelete(false)}>
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-11 items-center gap-1.5 text-sm text-sub"
            >
              <TrashIcon size={16} />
              刪除物件
            </button>
          )}
        </div>
      </main>

    </div>
  );
}

function ContactSection({ listing: l }: { listing: Listing }) {
  const update = useListings((s) => s.update);
  const [newField, setNewField] = useState<ContactKind | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const setList = (key: 'phones' | 'lineIds' | 'igIds', index: number, value: string) => {
    const list = [...l[key]];
    if (index >= list.length) list.push(value);
    else list[index] = value;
    update(l.id, { [key]: list.filter(Boolean) }, [key]);
  };

  const openLineByPhone = async (phone: string) => {
    // LINE 沒有「用電話號碼直接開聊天」的連結：先複製號碼，到 LINE 加好友頁貼上搜尋
    if (await copyText(phone)) setCopied(phone);
  };

  return (
    <section className="card flex flex-col gap-1 p-3.5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">聯絡方式</h2>
        {(l.phones.length > 0 || l.lineIds.length > 0 || l.igIds.length > 0) && (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-[#553A2A]">從截圖解析</span>
        )}
      </div>

      <EditableRow
        label="聯絡人"
        value={[l.contactName, l.contactRole].filter(Boolean).join(' · ')}
        placeholder="例如：王小姐 · 代管"
        uncertain={l.uncertain.includes('contactName')}
          onConfirm={() => update(l.id, {}, ['contactName'])}
        onSave={(v) => {
          const [name, ...role] = v.split(/[·・,，]/).map((s) => s.trim());
          update(l.id, { contactName: name ?? '', contactRole: role.join(' ') }, ['contactName']);
        }}
      />

      {l.phones.map((phone, i) => (
        <EditableRow
          key={`p-${i}-${phone}`}
          label="電話"
          value={phone}
          inputMode="tel"
          uncertain={l.uncertain.includes('phones')}
          onConfirm={() => update(l.id, {}, ['phones'])}
          leading={<ContactBadge kind="phone" />}
          trailing={
            <a
              href={telHref(phone)}
              className="flex h-10 shrink-0 items-center rounded-full bg-status-contacted px-3.5 text-sm font-medium text-white"
            >
              撥打
            </a>
          }
          onSave={(v) => setList('phones', i, v)}
        />
      ))}

      {l.lineIds.map((lineId, i) => {
        const byPhone = lineIsPhone(lineId);
        return (
          <EditableRow
            key={`l-${i}-${lineId}`}
            label={byPhone ? 'LINE（用電話號碼加）' : 'LINE ID'}
            value={lineId}
            uncertain={l.uncertain.includes('lineIds')}
          onConfirm={() => update(l.id, {}, ['lineIds'])}
            leading={<ContactBadge kind="line" />}
            trailing={
              <a
                href={lineHref(lineId)}
                target="_blank"
                rel="noreferrer"
                onClick={byPhone ? () => openLineByPhone(lineId) : undefined}
                className="flex h-10 shrink-0 items-center rounded-full bg-[#14632F] px-3.5 text-sm font-medium text-white"
              >
                {byPhone ? '複製開 LINE' : '開 LINE'}
              </a>
            }
            onSave={(v) => setList('lineIds', i, v)}
          />
        );
      })}

      {l.igIds.map((igId, i) => (
        <EditableRow
          key={`i-${i}-${igId}`}
          label="IG"
          value={igId}
          uncertain={l.uncertain.includes('igIds')}
          onConfirm={() => update(l.id, {}, ['igIds'])}
          leading={<ContactBadge kind="ig" />}
          trailing={
            <a
              href={igHref(igId)}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 shrink-0 items-center rounded-full bg-[#C13584] px-3.5 text-sm font-medium text-white"
            >
              開 IG
            </a>
          }
          onSave={(v) => setList('igIds', i, igHandle(v))}
        />
      ))}

      {copied && <p className="text-xs text-sub">已複製 {copied}，在 LINE「加入好友 → 搜尋 → 電話號碼」貼上</p>}

      {newField && (
        <EditableRow
          label={NEW_CONTACT[newField].label}
          value=""
          inputMode={newField === 'phone' ? 'tel' : 'text'}
          startEditing
          leading={<ContactBadge kind={newField} />}
          onSave={(v) => {
            const value = newField === 'ig' ? igHandle(v) : v;
            if (value) setList(NEW_CONTACT[newField].key, Number.MAX_SAFE_INTEGER, value);
            setNewField(null);
          }}
        />
      )}

      <div className="flex flex-wrap gap-x-4 pt-1">
        {(Object.keys(NEW_CONTACT) as ContactKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setNewField(kind)}
            className="flex h-11 items-center gap-1.5 text-sm font-medium text-brand"
          >
            <PlusIcon size={16} />
            {NEW_CONTACT[kind].button}
          </button>
        ))}
      </div>
      <p className="text-xs text-sub">把欄位清空再儲存就會刪掉那一筆。</p>
    </section>
  );
}

type ContactKind = 'phone' | 'line' | 'ig';

const NEW_CONTACT: Record<ContactKind, { key: 'phones' | 'lineIds' | 'igIds'; label: string; button: string }> = {
  phone: { key: 'phones', label: '新電話', button: '新增電話' },
  line: { key: 'lineIds', label: '新 LINE ID', button: '新增 LINE' },
  ig: { key: 'igIds', label: '新 IG 帳號', button: '新增 IG' },
};

function ContactBadge({ kind }: { kind: ContactKind }) {
  return (
    <span
      className={clsx(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        kind === 'phone' && 'bg-[#E3ECEC] text-[#2F5157]',
        kind === 'line' && 'bg-[#DDF5E4] text-[#14632F]',
        kind === 'ig' && 'bg-[#F6E6EA] text-[#8C3A4E]',
      )}
    >
      {kind === 'phone' && <PhoneIcon size={18} />}
      {kind === 'line' && <LineIcon size={18} />}
      {kind === 'ig' && <InstagramIcon size={18} />}
    </span>
  );
}

function CoverSection({ listing: l }: { listing: Listing }) {
  const update = useListings((s) => s.update);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCover = (coverImage: string | undefined) => {
    const previous = l.coverImage;
    try {
      update(l.id, { coverImage });
      setError(null);
    } catch {
      // localStorage 容量用完時寫入會失敗：還原，避免畫面顯示了但其實沒存到
      update(l.id, { coverImage: previous });
      setError('裝置空間不足，首圖沒有存到。可以刪掉一些不需要的物件或首圖再試一次。');
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      setCover(await resizeCoverImage(file));
    } catch {
      setError('這張照片讀不出來，請換一張試試');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="首圖" className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {l.coverImage ? (
        <div className="relative overflow-hidden rounded-2xl bg-[#E9E5DE]">
          <img src={l.coverImage} alt="房子照片" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-9 rounded-full bg-ink/70 px-3.5 text-sm text-white"
            >
              {busy ? '處理中…' : '更換'}
            </button>
            <button
              type="button"
              onClick={() => setCover(undefined)}
              className="h-9 rounded-full bg-ink/70 px-3.5 text-sm text-white"
            >
              移除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-[#B9B3A8] text-sm text-sub"
        >
          <ImageIcon size={24} />
          {busy ? '處理中…' : '新增首圖（房子照片）'}
        </button>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-warn-bg px-3 py-2 text-[13px] text-warn-text">
          {error}
        </p>
      )}
    </section>
  );
}

function MessageSection({ listing: l }: { listing: Listing }) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [text, setText] = useState(() => buildMessage(TEMPLATES[0], l));
  const [flash, setFlash] = useState<string | null>(null);
  const setTemplate = usePreferences((s) => s.setTemplate);
  const isProfile = templateId === PROFILE_TEMPLATE_ID;

  // 個人資訊範本：邊打邊存成使用者自己的公版，下一間物件會直接帶入
  const changeText = (value: string) => {
    setText(value);
    if (isProfile) setTemplate(PROFILE_TEMPLATE_ID, value);
  };

  const pickTemplate = (id: string) => {
    const template = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
    setTemplateId(template.id);
    setText(buildMessage(template, l));
  };

  const copy = async () => {
    setFlash((await copyText(text)) ? '已複製' : '複製失敗，請長按文字複製');
    window.setTimeout(() => setFlash(null), 2500);
  };

  return (
    <section id="message" className="card flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
          <ChatIcon size={16} />
          私訊
        </h2>
        <div className="flex items-center gap-1">
          {flash && (
            <span role="status" className="text-[13px] text-brand">
              {flash}
            </span>
          )}
          <button
            type="button"
            onClick={copy}
            aria-label="複製訊息"
            title="複製訊息"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
          >
            <CopyIcon size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={t.id === templateId}
            onClick={() => pickTemplate(t.id)}
            className={clsx(
              'h-9 rounded-full px-3.5 text-[13px]',
              t.id === templateId ? 'bg-ink text-white' : 'border border-line bg-white',
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      <label htmlFor="message-text" className="sr-only">
        私訊內容
      </label>
      <textarea
        id="message-text"
        value={text}
        onChange={(e) => changeText(e.target.value)}
        rows={isProfile ? 16 : 7}
        className="w-full resize-none rounded-xl bg-cream p-3 text-[15px] leading-7 outline-none focus:ring-2 focus:ring-brand"
      />
      <p className="text-xs text-sub">
        {isProfile
          ? '填過的內容會自動記住，下一間物件也會帶入；也可以到「設定」修改。'
          : '租金、物件編號會自動帶入；[ ] 裡的字記得換掉。範本內容可以到「設定」修改。'}
      </p>
    </section>
  );
}

function NotesSection({ listing: l }: { listing: Listing }) {
  const { addNote, removeNote } = useListings();
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    addNote(l.id, text.trim());
    setText('');
  };

  return (
    <section className="card flex flex-col gap-2.5 p-3.5">
      <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
        <NoteIcon size={16} />
        備註
      </h2>
      {l.notes.length > 0 && (
        <ul className="flex flex-col gap-1">
          {l.notes.map((n) => {
            const d = new Date(n.at);
            return (
              <li key={n.id} className="group flex items-start gap-2 text-sm leading-normal">
                <span className="shrink-0 pt-px text-sub">
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
                <span className="flex-1 whitespace-pre-line">{n.text}</span>
                <button
                  type="button"
                  aria-label="刪除這條備註"
                  onClick={() => removeNote(l.id, n.id)}
                  className="-mt-2 flex h-9 w-9 shrink-0 items-center justify-center text-sub"
                >
                  <TrashIcon size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="flex h-11 items-center gap-2 rounded-xl bg-cream pl-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="new-note">
          新增備註
        </label>
        <input
          id="new-note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新增備註…（例如：採光好、巷口有點吵）"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button type="submit" disabled={!text.trim()} className="h-11 px-3 text-sm font-medium text-brand disabled:text-sub">
          新增
        </button>
      </form>
    </section>
  );
}
