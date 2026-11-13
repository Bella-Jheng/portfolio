'use client';

import { create } from 'zustand';
import { listingSyncHooks, useListings } from './store';
import { preferencesSyncHooks, usePreferences } from './preferences';
import type { Listing } from './types';

/**
 * 物件與私訊範本的雲端同步（Firebase，透過 /api/listings、/api/preferences）。
 *
 * - 登入後 start()：下載雲端資料，跟這台裝置的資料合併（同一筆以 updatedAt 新的為準），
 *   只在這台裝置的物件會上傳，所以登入前新增的物件不會不見。
 * - 之後每次修改由 store 的掛勾通知，延遲一下再上傳（打字時不會每個字都送一次）。
 * - 登出 stop()：清掉這台裝置上的資料，避免共用裝置被下一個人看到。
 */

type SyncStatus = 'off' | 'syncing' | 'synced' | 'error';

export const useSyncStatus = create<{ status: SyncStatus; message: string | null }>(() => ({
  status: 'off',
  message: null,
}));

const SAVE_DELAY_MS = 800;

let getToken: (() => Promise<string | null>) | null = null;
const listingTimers = new Map<string, ReturnType<typeof setTimeout>>();
let templatesTimer: ReturnType<typeof setTimeout> | undefined;

function setStatus(status: SyncStatus, message: string | null = null) {
  useSyncStatus.setState({ status, message });
}

/** 給其他畫面用的 API 呼叫（分享、一起找房）：自動帶登入憑證，失敗時丟出錯誤訊息 */
export function cloudApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  return api<T>(path, init);
}

/** 共用設定改變後重新下載（例如被邀請、離開別人的清單） */
export async function resyncCloud() {
  if (getToken) await startCloudSync(getToken);
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken ? await getToken() : null;
  if (!token) throw new Error('請先用 Google 登入');
  const res = await fetch(path, {
    ...init,
    headers: { ...init.headers, 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? '雲端同步失敗');
  return data;
}

async function run(task: () => Promise<unknown>) {
  setStatus('syncing');
  try {
    await task();
    // 還有排隊中的上傳時維持「同步中」
    if (listingTimers.size === 0 && !templatesTimer) setStatus('synced');
  } catch (error) {
    setStatus('error', error instanceof Error ? error.message : '雲端同步失敗');
  }
}

function saveListing(listing: Listing) {
  clearTimeout(listingTimers.get(listing.id));
  listingTimers.set(
    listing.id,
    setTimeout(() => {
      listingTimers.delete(listing.id);
      // 送出時拿最新的那一筆，避免把延遲期間的修改漏掉
      const latest = useListings.getState().listings.find((l) => l.id === listing.id) ?? listing;
      run(() => api(`/api/listings/${encodeURIComponent(latest.id)}`, { method: 'PUT', body: JSON.stringify(latest) }));
    }, SAVE_DELAY_MS),
  );
  setStatus('syncing');
}

function removeListing(id: string) {
  clearTimeout(listingTimers.get(id));
  listingTimers.delete(id);
  run(() => api(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}

function saveTemplates() {
  clearTimeout(templatesTimer);
  templatesTimer = setTimeout(() => {
    templatesTimer = undefined;
    const templates = usePreferences.getState().templates;
    run(() => api('/api/preferences', { method: 'PUT', body: JSON.stringify({ templates }) }));
  }, SAVE_DELAY_MS);
  setStatus('syncing');
}

function newer(a: Listing, b: Listing): Listing {
  return (a.updatedAt ?? '') >= (b.updatedAt ?? '') ? a : b;
}

export async function startCloudSync(tokenGetter: () => Promise<string | null>) {
  getToken = tokenGetter;
  setStatus('syncing');
  try {
    // 先記下 uid ↔ email 的對應，同時確認這個帳號在白名單裡
    await api('/api/session', { method: 'POST' });
    const [{ listings: remote }, { templates: remoteTemplates }] = await Promise.all([
      api<{ listings: Listing[] }>('/api/listings'),
      api<{ templates: Record<string, string> | null }>('/api/preferences'),
    ]);

    // 物件：合併兩邊，同一筆取比較新的；這台裝置比較新或只有這台有的要上傳
    const remoteById = new Map(remote.map((l) => [l.id, l]));
    const local = useListings.getState().listings;
    const toUpload: Listing[] = [];
    const merged = new Map(remoteById);
    for (const l of local) {
      const r = remoteById.get(l.id);
      // 別人共用的物件雲端沒有了（取消共用或被刪掉），這台也拿掉，不要再上傳
      if (!r && l.sharedBy) continue;
      const winner = r ? newer(l, r) : l;
      merged.set(l.id, winner);
      if (winner === l && (!r || r.updatedAt !== l.updatedAt)) toUpload.push(l);
    }
    const listings = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    useListings.getState().replaceAll(listings);
    for (const l of toUpload) {
      await api(`/api/listings/${encodeURIComponent(l.id)}`, { method: 'PUT', body: JSON.stringify(l) });
    }

    // 範本：雲端有就用雲端的；雲端還沒有、這台有改過，就把這台的上傳
    const localTemplates = usePreferences.getState().templates;
    if (remoteTemplates) {
      usePreferences.getState().replaceTemplates(remoteTemplates);
    } else if (Object.keys(localTemplates).length > 0) {
      await api('/api/preferences', { method: 'PUT', body: JSON.stringify({ templates: localTemplates }) });
    }

    // 初次同步成功才開始把之後的修改送上雲端
    listingSyncHooks.save = saveListing;
    listingSyncHooks.remove = removeListing;
    preferencesSyncHooks.save = saveTemplates;
    setStatus('synced');
  } catch (error) {
    // 例如帳號不在允許名單：保留這台裝置的資料，不同步
    getToken = null;
    setStatus('error', error instanceof Error ? error.message : '雲端同步失敗');
  }
}

/** 把還在排隊的上傳立刻送出（登出前呼叫，避免最後幾秒的修改沒存到） */
export async function flushCloudSync() {
  if (!getToken) return;
  const pendingIds = [...listingTimers.keys()];
  listingTimers.forEach((t) => clearTimeout(t));
  listingTimers.clear();
  const pendingTemplates = !!templatesTimer;
  clearTimeout(templatesTimer);
  templatesTimer = undefined;
  const { listings } = useListings.getState();
  await run(() =>
    Promise.all([
      ...pendingIds.flatMap((id) => {
        const l = listings.find((x) => x.id === id);
        return l ? [api(`/api/listings/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(l) })] : [];
      }),
      ...(pendingTemplates
        ? [api('/api/preferences', { method: 'PUT', body: JSON.stringify({ templates: usePreferences.getState().templates }) })]
        : []),
    ]),
  );
}

export function stopCloudSync({ clearLocal }: { clearLocal: boolean }) {
  getToken = null;
  listingSyncHooks.save = null;
  listingSyncHooks.remove = null;
  preferencesSyncHooks.save = null;
  listingTimers.forEach((t) => clearTimeout(t));
  listingTimers.clear();
  clearTimeout(templatesTimer);
  templatesTimer = undefined;
  if (clearLocal) {
    useListings.getState().replaceAll([]);
    usePreferences.getState().replaceTemplates({});
  }
  setStatus('off');
}
