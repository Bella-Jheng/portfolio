'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  /** 使用者改過的私訊範本文字（key 是範本 id）；沒有的就用預設內容 */
  templates: Record<string, string>;
  setTemplate: (id: string, text: string) => void;
  resetTemplate: (id: string) => void;
}

// 個人偏好只存在這台裝置（localStorage），跟物件資料分開存
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      templates: {},
      setTemplate: (id, text) => set((s) => ({ templates: { ...s.templates, [id]: text } })),
      resetTemplate: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.templates;
          return { templates: rest };
        }),
    }),
    {
      name: 'rental-helper:preferences',
      version: 2,
      // v1 → v2：原本只存「個人資訊」一份文字，改成每個範本都能自訂
      migrate: (persisted, version) => {
        if (version < 2) {
          const old = persisted as { profileMessage?: string | null };
          return { templates: old.profileMessage ? { profile: old.profileMessage } : {} } as PreferencesState;
        }
        return persisted as PreferencesState;
      },
    },
  ),
);
