'use client';

import { create } from 'zustand';
import { STATUSES, type Status } from './types';

/**
 * 首頁的篩選和選取狀態。
 * 地圖由 PersistentMap 掛在 layout 上（換頁不會拆掉重建），首頁只負責標題和篩選按鈕，
 * 兩邊透過這個 store 共用狀態。
 */
type MapUiState = {
  active: Status[];
  selectedId: string | null;
  toggle: (s: Status) => void;
  setSelected: (id: string | null) => void;
};

export const useMapUi = create<MapUiState>((set) => ({
  active: STATUSES,
  selectedId: null,
  toggle: (s) =>
    set((state) => ({
      active: state.active.includes(s) ? state.active.filter((x) => x !== s) : [...state.active, s],
    })),
  setSelected: (id) => set({ selectedId: id }),
}));
