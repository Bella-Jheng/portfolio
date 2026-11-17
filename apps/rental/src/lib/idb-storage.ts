import type { StateStorage } from 'zustand/middleware';

/**
 * 給 zustand persist 用的 IndexedDB 儲存。
 *
 * 之前物件（含首圖照片的 data URL）直接存在 localStorage，整個網站只有約 5MB，
 * 存二、三十張首圖就會「儲存空間不足」。IndexedDB 的容量是以 GB 計（依裝置剩餘空間而定），
 * 所以改存這裡；第一次讀取時會把 localStorage 裡的舊資料搬過來，再把舊的刪掉釋放空間。
 * 瀏覽器不支援 IndexedDB 時（極少數隱私模式）退回 localStorage。
 */

const DB_NAME = 'rental-helper';
const STORE = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    // 開不起來就下次再試，不要卡在失敗的 promise
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error ?? req.error);
        t.onabort = () => reject(t.error ?? new Error('IndexedDB transaction aborted'));
      }),
  );
}

function hasIndexedDb(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

function legacyGet(name: string): string | null {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
}

function legacyRemove(name: string) {
  try {
    localStorage.removeItem(name);
  } catch {
    /* ignore */
  }
}

let persistRequested = false;
/** 請瀏覽器把這個網站的資料標成「持久」，避免空間吃緊或久沒開時被自動清掉（Safari 尤其會） */
function requestPersist() {
  if (persistRequested) return;
  persistRequested = true;
  navigator.storage?.persist?.().catch(() => undefined);
}

export const idbStorage: StateStorage = {
  async getItem(name) {
    if (!hasIndexedDb()) return legacyGet(name);
    requestPersist();
    try {
      const value = await tx<string | undefined>('readonly', (s) => s.get(name) as IDBRequest<string | undefined>);
      if (value != null) {
        legacyRemove(name); // 已經搬過了，舊的清掉
        return value;
      }
      // 第一次：從 localStorage 搬過來
      const legacy = legacyGet(name);
      if (legacy != null) {
        await tx('readwrite', (s) => s.put(legacy, name));
        legacyRemove(name);
      }
      return legacy;
    } catch {
      return legacyGet(name);
    }
  },
  async setItem(name, value) {
    if (!hasIndexedDb()) {
      localStorage.setItem(name, value);
      return;
    }
    try {
      await tx('readwrite', (s) => s.put(value, name));
    } catch (error) {
      console.error('儲存物件資料失敗', error);
      throw error;
    }
  },
  async removeItem(name) {
    legacyRemove(name);
    if (!hasIndexedDb()) return;
    await tx('readwrite', (s) => s.delete(name)).catch(() => undefined);
  },
};
