'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing, Note, ParsedField, Status } from './types';

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
    status: 'contacting',
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
    notes: [],
    uncertain: [],
    ...partial,
  };
}

interface ListingState {
  listings: Listing[];
  add: (listing: Listing) => void;
  update: (id: string, patch: Partial<Listing>, touched?: ParsedField[]) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  addNote: (id: string, text: string) => void;
  removeNote: (id: string, noteId: string) => void;
}

// v1 資料只存在這台裝置的瀏覽器（localStorage）。之後要跟一起找房的人共用，
// 把這個 store 換成 Firestore 之類的後端就好，畫面不用動。
export const useListings = create<ListingState>()(
  persist(
    (set) => ({
      listings: [],
      add: (listing) => set((s) => ({ listings: [listing, ...s.listings] })),
      update: (id, patch, touched = []) =>
        set((s) => ({
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
      remove: (id) => set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l,
          ),
        })),
      addNote: (id, text) =>
        set((s) => ({
          listings: s.listings.map((l) => {
            if (l.id !== id) return l;
            const note: Note = { id: newId(), at: new Date().toISOString(), text };
            return { ...l, notes: [note, ...l.notes], updatedAt: note.at };
          }),
        })),
      removeNote: (id, noteId) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, notes: l.notes.filter((n) => n.id !== noteId) } : l,
          ),
        })),
    }),
    { name: 'rental-helper:listings', version: 1 },
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
