'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { emptyListing, useListings } from '../../lib/store';
import { resizeImage } from '../../lib/image';
import { useGeocode } from '../../lib/geocode';
import { SOURCE_LABEL, type ParseResult, type Source } from '../../lib/types';
import { BackIcon, CloseIcon, PlusIcon, SparkIcon } from '../../components/icons';

const MAX_IMAGES = 6;
const CODE_KEY = 'rental-helper:access-code';

interface Picked {
  file: File;
  url: string;
}

export default function AddPage() {
  const router = useRouter();
  const add = useListings((s) => s.add);
  const geocode = useGeocode();
  const inputRef = useRef<HTMLInputElement>(null);

  const [picked, setPicked] = useState<Picked[]>([]);
  const [sameListing, setSameListing] = useState(true);
  const [source, setSource] = useState<Source>('591');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needCode, setNeedCode] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    try {
      setCode(localStorage.getItem(CODE_KEY) ?? '');
    } catch {
      /* ignore */
    }
  }, []);

  // 離開頁面時釋放預覽圖
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPicked((prev) => [...prev, ...next].slice(0, MAX_IMAGES));
    setError(null);
  };

  const removeAt = (i: number) =>
    setPicked((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });

  async function parseGroup(files: File[]): Promise<{ result: ParseResult; thumbnail: string }> {
    const images = await Promise.all(files.map((f) => resizeImage(f, 1600)));
    const thumb = await resizeImage(files[0], 240, 0.7);
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-code': code },
      body: JSON.stringify({ images: images.map((i) => ({ mimeType: i.mimeType, data: i.base64 })) }),
    });
    if (res.status === 401) {
      setNeedCode(true);
      throw new Error('請輸入存取碼');
    }
    const data = (await res.json()) as ParseResult & { error?: string };
    if (!res.ok) throw new Error(data.error ?? '解析失敗');
    return { result: data, thumbnail: thumb.dataUrl };
  }

  async function createFrom(result: ParseResult, thumbnail: string) {
    const loc = await geocode(result.address);
    const listing = emptyListing({
      source,
      title: result.title,
      address: result.address,
      rent: result.rent ?? undefined,
      layout: result.layout,
      size: result.size,
      floor: result.floor,
      fees: result.fees,
      pets: result.pets,
      listingNo: result.listingNo,
      contactName: result.contactName,
      contactRole: result.contactRole,
      phones: result.phones,
      lineIds: result.lineIds,
      uncertain: result.uncertain,
      thumbnail,
      ...(loc ?? {}),
    });
    add(listing);
    return listing;
  }

  async function start() {
    if (picked.length === 0 || busy) return;
    setError(null);
    try {
      try {
        localStorage.setItem(CODE_KEY, code);
      } catch {
        /* ignore */
      }
      const groups = sameListing ? [picked.map((p) => p.file)] : picked.map((p) => [p.file]);
      let last = null;
      for (let i = 0; i < groups.length; i++) {
        setBusy(groups.length > 1 ? `解析中 ${i + 1} / ${groups.length}…` : '解析中…');
        const { result, thumbnail } = await parseGroup(groups[i]);
        last = await createFrom(result, thumbnail);
      }
      if (groups.length === 1 && last) router.replace(`/listing/${last.id}`);
      else router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失敗');
      setBusy(null);
    }
  }

  function manual() {
    const listing = emptyListing({ source });
    add(listing);
    router.replace(`/listing/${listing.id}`);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-1 px-3 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href="/" aria-label="返回" className="flex h-11 w-11 items-center justify-center">
          <BackIcon size={22} />
        </Link>
        <h1 className="text-xl font-bold">新增物件</h1>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-5 pb-36 pt-2">
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[15px] font-bold">
            {picked.length > 0 ? `已選 ${picked.length} 張截圖` : '選擇租屋截圖'}
          </h2>
          {picked.length > 0 && (
            <ul className="grid grid-cols-3 gap-2.5">
              {picked.map((p, i) => (
                <li key={p.url} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-[#DDE3EA]">
                  <img src={p.url} alt={`截圖 ${i + 1}`} className="h-full w-full object-cover object-top" />
                  <button
                    type="button"
                    aria-label={`移除截圖 ${i + 1}`}
                    onClick={() => removeAt(i)}
                    className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white"
                  >
                    <CloseIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = '';
            }}
          />
          {picked.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={clsx(
                'flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#9AA4B0] text-sm',
                picked.length === 0 ? 'h-40 flex-col text-base' : 'h-12',
              )}
            >
              <PlusIcon size={picked.length === 0 ? 28 : 18} />
              {picked.length === 0 ? '從相簿選截圖（最多 6 張）' : '從相簿再加截圖'}
            </button>
          )}
        </section>

        <section className="card flex flex-col gap-3.5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-medium">這幾張是同一間物件</p>
              <p className="text-[13px] text-sub">關閉的話，每張截圖各自建一筆</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sameListing}
              aria-label="這幾張是同一間物件"
              onClick={() => setSameListing((v) => !v)}
              className={clsx(
                'relative h-8 w-[52px] shrink-0 rounded-full transition-colors',
                sameListing ? 'bg-brand' : 'bg-[#C5CCD4]',
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 h-6 w-6 rounded-full bg-white transition-all',
                  sameListing ? 'right-1' : 'left-1',
                )}
              />
            </button>
          </div>
          <div className="h-px bg-[#E3E8EE]" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] font-medium">來源</p>
            <div className="flex gap-2">
              {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={source === s}
                  onClick={() => setSource(s)}
                  className={clsx(
                    'h-9 rounded-full px-3.5 text-sm',
                    source === s ? 'bg-ink text-white' : 'border border-line bg-white',
                  )}
                >
                  {SOURCE_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {needCode && (
          <label className="card flex flex-col gap-2 p-4">
            <span className="text-[15px] font-medium">存取碼</span>
            <span className="text-[13px] text-sub">這個網站有設存取碼，輸入一次之後會記在這台裝置。</span>
            <input
              className="field-input"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
            />
          </label>
        )}

        <aside className="rounded-2xl bg-brand-soft p-3.5 text-[13px] leading-relaxed text-[#0F3F3A]">
          截圖時讓<b>地址</b>、<b>物件編號</b>和<b>聯絡電話／LINE</b> 入鏡，解析會更準。
        </aside>

        {error && (
          <p role="alert" className="rounded-xl bg-warn-bg px-3 py-2.5 text-sm text-warn-text">
            {error}
          </p>
        )}

        <button type="button" onClick={manual} className="self-center text-sm text-brand underline">
          沒有截圖，手動新增
        </button>
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-[#E3E8EE] bg-ground px-5 pt-4">
        <button
          type="button"
          onClick={start}
          disabled={picked.length === 0 || busy != null}
          className="btn-primary h-14 w-full rounded-2xl text-base font-bold"
        >
          <SparkIcon size={20} />
          {busy ?? '開始解析'}
        </button>
      </div>
    </div>
  );
}
