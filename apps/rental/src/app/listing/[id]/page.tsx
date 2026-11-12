'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useHydrated, useListings } from '../../../lib/store';
import { useGeocode } from '../../../lib/geocode';
import { STATUSES, STATUS_META, type Listing, type ParsedField } from '../../../lib/types';
import { copyText, lineHref, lineIsPhone, mapsSearchHref, telHref } from '../../../lib/contact';
import { EditableRow } from '../../../components/EditableRow';
import { MAPS_KEY } from '../../../components/Providers';
import {
  BackIcon,
  ChatIcon,
  ExternalIcon,
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

      <main className="flex flex-1 flex-col gap-3 px-4 pb-32 pt-1">
        {l.uncertain.length > 0 && (
          <p className="mx-1 text-[13px] text-sub">
            <span className="font-medium text-warn-text">黃色欄位</span>是 AI 沒把握的，請再確認一次。
          </p>
        )}

        {/* 狀態 */}
        <section aria-label="狀態" className="grid grid-cols-4 gap-1.5">
          {STATUSES.map((s) => {
            const meta = STATUS_META[s];
            const on = l.status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStatus(l.id, s)}
                className="h-10 rounded-full text-[13px] font-medium transition-colors"
                style={
                  on
                    ? { background: meta.color, color: '#fff' }
                    : { background: '#fff', color: meta.softText, border: '1px solid #D5DAE0' }
                }
              >
                {meta.label}
              </button>
            );
          })}
        </section>

        {/* 物件資訊 */}
        <section className="card flex flex-col px-3.5 py-1">
          <EditableRow label="標題" value={l.title} uncertain={isUncertain('title')} onSave={(v) => save('title', { title: v })} />
          <EditableRow
            label="租金（每月）"
            value={l.rent != null ? String(l.rent) : ''}
            inputMode="numeric"
            uncertain={isUncertain('rent')}
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
            onSave={saveAddress}
          />
          <EditableRow label="房型" value={l.layout} uncertain={isUncertain('layout')} onSave={(v) => save('layout', { layout: v })} />
          <EditableRow label="坪數" value={l.size} uncertain={isUncertain('size')} onSave={(v) => save('size', { size: v })} />
          <EditableRow label="樓層" value={l.floor} uncertain={isUncertain('floor')} onSave={(v) => save('floor', { floor: v })} />
          <EditableRow label="費用與條件" value={l.fees} uncertain={isUncertain('fees')} onSave={(v) => save('fees', { fees: v })} />
          <EditableRow label="寵物" value={l.pets} uncertain={isUncertain('pets')} onSave={(v) => save('pets', { pets: v })} />
          <EditableRow
            label="物件編號"
            value={l.listingNo}
            uncertain={isUncertain('listingNo')}
            uncertainHint="截圖裡沒找到"
            onSave={(v) => save('listingNo', { listingNo: v })}
          />
        </section>

        <ContactSection listing={l} />
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

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-[#E3E8EE] bg-ground px-5 pt-3.5">
        <Link href={`/listing/${l.id}/message`} className="btn-primary h-14 w-full rounded-2xl text-base font-bold">
          <ChatIcon size={20} />
          產生私訊
        </Link>
      </div>
    </div>
  );
}

function ContactSection({ listing: l }: { listing: Listing }) {
  const update = useListings((s) => s.update);
  const [newField, setNewField] = useState<'phone' | 'line' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const setList = (key: 'phones' | 'lineIds', index: number, value: string) => {
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
        {(l.phones.length > 0 || l.lineIds.length > 0) && (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-[#0F5E57]">從截圖解析</span>
        )}
      </div>

      <EditableRow
        label="聯絡人"
        value={[l.contactName, l.contactRole].filter(Boolean).join(' · ')}
        placeholder="例如：王小姐 · 代管"
        uncertain={l.uncertain.includes('contactName')}
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
          leading={<ContactBadge kind="phone" />}
          trailing={
            <a
              href={telHref(phone)}
              className="flex h-10 shrink-0 items-center rounded-full bg-status-contacting px-3.5 text-sm font-medium text-white"
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

      {copied && <p className="text-xs text-sub">已複製 {copied}，在 LINE「加入好友 → 搜尋 → 電話號碼」貼上</p>}

      {newField && (
        <EditableRow
          label={newField === 'phone' ? '新電話' : '新 LINE ID'}
          value=""
          inputMode={newField === 'phone' ? 'tel' : 'text'}
          startEditing
          leading={<ContactBadge kind={newField} />}
          onSave={(v) => {
            if (v) setList(newField === 'phone' ? 'phones' : 'lineIds', Number.MAX_SAFE_INTEGER, v);
            setNewField(null);
          }}
        />
      )}

      <div className="flex gap-4 pt-1">
        <button
          type="button"
          onClick={() => setNewField('phone')}
          className="flex h-11 items-center gap-1.5 text-sm font-medium text-brand"
        >
          <PlusIcon size={16} />
          新增電話
        </button>
        <button
          type="button"
          onClick={() => setNewField('line')}
          className="flex h-11 items-center gap-1.5 text-sm font-medium text-brand"
        >
          <PlusIcon size={16} />
          新增 LINE
        </button>
      </div>
      <p className="text-xs text-sub">把欄位清空再儲存就會刪掉那一筆。</p>
    </section>
  );
}

function ContactBadge({ kind }: { kind: 'phone' | 'line' }) {
  return (
    <span
      className={clsx(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        kind === 'phone' ? 'bg-[#E0ECFB] text-[#1E4E8C]' : 'bg-[#DDF5E4] text-[#14632F]',
      )}
    >
      {kind === 'phone' ? <PhoneIcon size={18} /> : <LineIcon size={18} />}
    </span>
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
        className="flex h-11 items-center gap-2 rounded-xl bg-ground pl-3"
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
