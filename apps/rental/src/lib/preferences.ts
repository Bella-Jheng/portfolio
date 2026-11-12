'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 房仲常會問的個人資訊，第一次使用時的預設內容 */
export const DEFAULT_PROFILE_MESSAGE = `‼️以下為個人資訊，請勿轉傳，如需分享請事先詢問‼️
地點偏好：
預算：
房型偏好：
可接受爬梯樓層：
是否需停汽車：

寵物類型（幾隻）：
是/否 租屋補助：

預計入住人數（關係）：
預計入住日期(可起租日)：

年齡：
職業：
聯絡電話：`;

interface PreferencesState {
  /** 使用者填過的個人資訊；null 代表還沒填過，用預設內容 */
  profileMessage: string | null;
  setProfileMessage: (text: string) => void;
  resetProfileMessage: () => void;
}

// 個人偏好只存在這台裝置（localStorage），跟物件資料分開存
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      profileMessage: null,
      setProfileMessage: (text) => set({ profileMessage: text }),
      resetProfileMessage: () => set({ profileMessage: null }),
    }),
    { name: 'rental-helper:preferences', version: 1 },
  ),
);

export function getProfileMessage(): string {
  return usePreferences.getState().profileMessage ?? DEFAULT_PROFILE_MESSAGE;
}
