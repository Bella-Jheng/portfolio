'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { emptyListing, useListings } from '../../lib/store';
import { resizeCoverImage, resizeImage } from '../../lib/image';
import { useGeocode } from '../../lib/geocode';
import type { ParseResult, Source } from '../../lib/types';
import { SourcePicker } from '../../components/SourcePicker';
import { BackIcon, CloseIcon, ImageIcon, PlusIcon, SparkIcon } from '../../components/icons';
import {
  ListingDraftForm,
  draftFromResult,
  parseRent,
  splitList,
  type DraftValues,
} from '../../components/ListingDraftForm';
import { detectSource, igHandle, normalizeUrl } from '../../lib/contact';
import { useAuth } from '../../lib/auth';

const MAX_IMAGES = 6;

interface Picked {
  file: File;
  url: string;
}

interface Draft {
  values: DraftValues;
  thumbnail: string;
}

export default function AddPage() {
  const router = useRouter();
  const add = useListings((s) => s.add);
  const geocode = useGeocode();
  const { user, loading: authLoading, configured: authConfigured, login, getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [picked, setPicked] = useState<Picked[]>([]);
  const [cover, setCover] = useState<Picked | null>(null);
  const [sameListing, setSameListing] = useState(true);
  const [source, setSource] = useState<Source>('591');
  const [sourceUrl, setSourceUrl] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  // AI 解析完先放在草稿讓使用者確認、修改，按「儲存」才真的建立物件
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 離開頁面時釋放預覽圖
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  const coverRef = useRef(cover);
  coverRef.current = cover;
  useEffect(
    () => () => {
      pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url));
      if (coverRef.current) URL.revokeObjectURL(coverRef.current.url);
    },
    [],
  );

  const onCoverFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (cover) URL.revokeObjectURL(cover.url);
    setCover({ file, url: URL.createObjectURL(file) });
  };

  const removeCover = () => {
    if (cover) URL.revokeObjectURL(cover.url);
    setCover(null);
  };

  // 首圖和房源出處只屬於一間物件：截圖拆成多筆時不套用
  const coverApplies = sameListing || picked.length <= 1;

  const changeSourceUrl = (value: string) => {
    setSourceUrl(value);
    // 貼上 591／FB／IG 的連結時，順便把來源切到對應的平台
    const detected = detectSource(normalizeUrl(value));
    if (detected) setSource(detected);
  };

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
    const token = await getToken();
    if (!token) throw new Error('請先用 Google 登入');
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ images: images.map((i) => ({ mimeType: i.mimeType, data: i.base64 })) }),
    });
    const data = (await res.json()) as ParseResult & { error?: string };
    if (!res.ok) throw new Error(data.error ?? '解析失敗');
    return { result: data, thumbnail: thumb.dataUrl };
  }

  async function createFrom({ values, thumbnail }: Draft, coverImage?: string) {
    const address = values.address.trim();
    const loc = await geocode(address);
    const listing = emptyListing({
      source: values.source,
      sourceUrl: normalizeUrl(values.sourceUrl),
      title: values.title.trim(),
      address,
      rent: parseRent(values.rent),
      layout: values.layout.trim(),
      size: values.size.trim(),
      floor: values.floor.trim(),
      fees: values.fees.trim(),
      pets: values.pets.trim(),
      listingNo: values.listingNo.trim(),
      contactName: values.contactName.trim(),
      contactRole: values.contactRole.trim(),
      phones: splitList(values.phones),
      lineIds: splitList(values.lineIds),
      igIds: splitList(values.igIds).map(igHandle).filter(Boolean),
      uncertain: values.uncertain,
      thumbnail,
      coverImage,
      ...(loc ?? {}),
    });
    add(listing);
    return listing;
  }

  async function start() {
    if (picked.length === 0 || busy) return;
    setError(null);
    try {
      const groups = sameListing ? [picked.map((p) => p.file)] : picked.map((p) => [p.file]);
      const parsed: Draft[] = [];
      for (let i = 0; i < groups.length; i++) {
        setBusy(groups.length > 1 ? `解析中 ${i + 1} / ${groups.length}…` : '解析中…');
        const { result, thumbnail } = await parseGroup(groups[i]);
        parsed.push({ values: draftFromResult(result, source, coverApplies ? sourceUrl.trim() : ''), thumbnail });
      }
      setDrafts(parsed);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失敗');
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!drafts || busy) return;
    setError(null);
    setBusy('儲存中…');
    try {
      const coverImage = cover && drafts.length === 1 ? await resizeCoverImage(cover.file) : undefined;
      let last = null;
      for (const draft of drafts) last = await createFrom(draft, coverImage);
      if (drafts.length === 1 && last) router.replace(`/listing/${last.id}`);
      else router.replace('/');
    } catch {
      setError('儲存失敗，裝置空間可能不足，請刪掉一些物件或首圖再試一次');
      setBusy(null);
    }
  }

  const updateDraft = (index: number, values: DraftValues) =>
    setDrafts((prev) => prev && prev.map((d, i) => (i === index ? { ...d, values } : d)));

  if (drafts) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-1 px-3 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="返回重新選截圖"
            onClick={() => setDrafts(null)}
            className="flex h-11 w-11 items-center justify-center"
          >
            <BackIcon size={22} />
          </button>
          <h1 className="text-xl font-bold">確認解析結果</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 px-5 pb-10 pt-2">
          <p className="text-[13px] text-sub">
            還沒儲存喔！請確認 AI 整理的內容，<span className="font-medium text-warn-text">黃色欄位</span>是 AI
            沒把握的，確認正確就按「沒問題」，不對就直接修改，最後按下方「儲存」。
          </p>

          {drafts.map((draft, i) => (
            <ListingDraftForm
              key={i}
              draft={draft.values}
              heading={drafts.length > 1 ? `第 ${i + 1} 間` : undefined}
              onChange={(values) => updateDraft(i, values)}
            />
          ))}

          {error && (
            <p role="alert" className="rounded-xl bg-warn-bg px-3 py-2.5 text-sm text-warn-text">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={busy != null}
            className="btn-primary h-14 w-full rounded-2xl text-base font-bold"
          >
            {busy ?? (drafts.length > 1 ? `儲存 ${drafts.length} 間物件` : '儲存')}
          </button>
          <button type="button" onClick={() => setDrafts(null)} className="self-center text-sm text-sub underline">
            放棄，重新選截圖
          </button>
        </main>
      </div>
    );
  }

  async function manual() {
    const coverImage = cover ? await resizeCoverImage(cover.file) : undefined;
    const listing = emptyListing({ source, coverImage, sourceUrl: normalizeUrl(sourceUrl) });
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
                <li key={p.url} className="relative aspect-[9/16] overflow-hidden rounded-xl border border-line bg-white">
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
                'flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#BDBDBD] text-sm',
                picked.length === 0 ? 'h-40 flex-col text-base' : 'h-12',
              )}
            >
              <PlusIcon size={picked.length === 0 ? 28 : 18} />
              {picked.length === 0 ? '從相簿選截圖（最多 6 張）' : '從相簿再加截圖'}
            </button>
          )}
        </section>

        <section className="flex flex-col gap-2.5">
          <div>
            <h2 className="text-[15px] font-bold">首圖（選填）</h2>
            <p className="text-[13px] text-sub">放一張房子的照片，方便之後一眼認出是哪間；不會拿去給 AI 解析。</p>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onCoverFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {cover ? (
            <div className="relative overflow-hidden rounded-xl border border-line bg-white">
              <img src={cover.url} alt="首圖" className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                aria-label="移除首圖"
                onClick={removeCover}
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex h-12 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#BDBDBD] text-sm"
            >
              <ImageIcon size={18} />
              選一張房子照片
            </button>
          )}
          {cover && !coverApplies && (
            <p className="text-[13px] text-warn-text">截圖拆成多筆物件時不會套用首圖，可以之後在各物件頁面再加。</p>
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
                sameListing ? 'bg-brand' : 'bg-[#CFCFCF]',
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
          <div className="h-px bg-[#EAEAEA]" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] font-medium">來源</p>
            <SourcePicker value={source} onChange={setSource} />
          </div>
          <div className="h-px bg-[#EAEAEA]" />
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-medium">房源出處（選填）</span>
            <span className="text-[13px] text-sub">貼上原始貼文或物件頁的連結，貼 591／FB／IG 的網址會自動選好來源</span>
            <input
              className="field-input bg-cream"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={sourceUrl}
              onChange={(e) => changeSourceUrl(e.target.value)}
            />
            {sourceUrl && !coverApplies && (
              <span className="text-[13px] text-warn-text">截圖拆成多筆物件時不會套用連結，可以之後在各物件頁面再加。</span>
            )}
          </label>
        </section>

        {!authLoading && !user && (
          <p className="card p-4 text-[13px] leading-relaxed text-sub">
            {authConfigured
              ? 'AI 解析需要先用 Google 登入，只有被允許的帳號可以使用。沒有登入也可以手動新增。'
              : '這個網站還沒設定 Google 登入，暫時不能用 AI 解析，可以先手動新增。'}
          </p>
        )}

        <aside className="rounded-2xl border border-line bg-white p-3.5 text-[13px] leading-relaxed text-[#4A3326]">
          截圖時讓<b>地址</b>、<b>物件編號</b>和<b>聯絡電話／LINE／IG</b> 入鏡，解析會更準。
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

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-[#EAEAEA] bg-ground px-5 pt-4">
        {user || authLoading || !authConfigured ? (
          <button
            type="button"
            onClick={start}
            disabled={picked.length === 0 || busy != null || !user}
            className="btn-primary h-14 w-full rounded-2xl text-base font-bold"
          >
            <SparkIcon size={20} />
            {busy ?? '開始解析'}
          </button>
        ) : (
          <button
            type="button"
            // 直接在點擊裡呼叫登入，iOS Safari 才不會擋下 Google 登入視窗
            onClick={async () => setError(await login())}
            className="btn-dark h-14 w-full rounded-2xl text-base font-bold"
          >
            Google 登入後開始解析
          </button>
        )}
      </div>
    </div>
  );
}
