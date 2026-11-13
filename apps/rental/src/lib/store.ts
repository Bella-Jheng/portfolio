'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing, Note, ParsedField, Status } from './types';

type PersistedListing = Omit<Listing, 'status' | 'igIds'> & { status: Status | 'contacting' | 'favorite'; igIds?: string[] };

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyListing(partial: Partial<Listing> = {}): Listing {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: 'not_contacted',
    source: '591',
    title: '',
    address: '',
    layout: '',
    size: '',
    floor: '',
    fees: '',
    pets: '',
    listingNo: '',
    contactName: '',
    contactRole: '',
    phones: [],
    lineIds: [],
    igIds: [],
    notes: [],
    uncertain: [],
    ...partial,
  };
}

/** 雲端同步掛勾：登入後由 cloud-sync 設定，未登入時是 null（資料只存在這台裝置） */
export const listingSyncHooks: {
  save: ((listing: Listing) => void) | null;
  remove: ((id: string) => void) | null;
} = { save: null, remove: null };

interface ListingState {
  listings: Listing[];
  /** 同步用：整批換掉（不會觸發上傳） */
  replaceAll: (listings: Listing[]) => void;
  add: (listing: Listing) => void;
  update: (id: string, patch: Partial<Listing>, touched?: ParsedField[]) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  toggleFavorite: (id: string) => void;
  addNote: (id: string, text: string) => void;
  removeNote: (id: string, noteId: string) => void;
}

// 資料先存在這台裝置（localStorage），登入後會同步到 Firebase（見 cloud-sync.ts）。
// 每個會改資料的動作做完後呼叫 changed()，把那一筆交給雲端同步上傳。
export const useListings = create<ListingState>()(
  persist(
    (set, get) => {
      const changed = (id: string) => {
        const listing = get().listings.find((l) => l.id === id);
        if (listing) listingSyncHooks.save?.(listing);
      };
      // 在原本的 set 之後順便通知同步
      const setAndSync = (id: string, fn: (s: ListingState) => Partial<ListingState>) => {
        set(fn);
        changed(id);
      };
      return {
      listings: [],
      replaceAll: (listings) => set({ listings }),
      add: (listing) => setAndSync(listing.id, (s) => ({ listings: [listing, ...s.listings] })),
      update: (id, patch, touched = []) =>
        setAndSync(id, (s) => ({
          listings: s.listings.map((l) =>
            l.id === id
              ? {
                  ...l,
                  ...patch,
                  // 使用者改過的欄位就不再標成「AI 不確定」
                  uncertain: l.uncertain.filter((f) => !touched.includes(f)),
                  updatedAt: new Date().toISOString(),
                }
              : l,
          ),
        })),
      remove: (id) => {
        set((s) => ({ listings: s.listings.filter((l) => l.id !== id) }));
        listingSyncHooks.remove?.(id);
      },
      setStatus: (id, status) =>
        setAndSync(id, (s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l,
          ),
        })),
      toggleFavorite: (id) =>
        setAndSync(id, (s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, favorite: !l.favorite, updatedAt: new Date().toISOString() } : l,
          ),
        })),
      addNote: (id, text) =>
        setAndSync(id, (s) => ({
          listings: s.listings.map((l) => {
            if (l.id !== id) return l;
            const note: Note = { id: newId(), at: new Date().toISOString(), text };
            return { ...l, notes: [note, ...l.notes], updatedAt: note.at };
          }),
        })),
      removeNote: (id, noteId) =>
        setAndSync(id, (s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, notes: l.notes.filter((n) => n.id !== noteId), updatedAt: new Date().toISOString() } : l,
          ),
        })),
      };
    },
    {
      name: 'rental-helper:listings',
      version: 3,
      // v1 → v2：「聯絡中」拆成「尚未聯絡／已聯絡」，舊的聯絡中視為已聯絡；新增 IG 聯絡方式
      migrate: (persisted, version) => {
        const state = persisted as { listings: PersistedListing[] };
        if (version < 2) {
          state.listings = state.listings.map((l) => ({
            ...l,
            status: l.status === 'contacting' ? 'contacted' : l.status,
            igIds: l.igIds ?? [],
          }));
        }
        // v2 → v3：「最想要」從狀態拆成獨立的愛心；原本狀態是最想要的，改成已聯絡＋愛心
        if (version < 3) {
          state.listings = state.listings.map((l) =>
            l.status === 'favorite' ? { ...l, status: 'contacted', favorite: true } : l,
          );
        }
        return state as unknown as ListingState;
      },
    },
  ),
);

/** localStorage 讀進來之前先不要渲染資料，避免 SSR/CSR 不一致 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useListings.persist.hasHydrated()) setHydrated(true);
    return useListings.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
