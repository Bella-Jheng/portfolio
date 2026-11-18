'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FortuneReading, Reading, TranslatableFortuneKey } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';
import { useLocale } from '../../../lib/i18n/locale-context';

/**
 * 結果頁要顯示的命盤內容（依介面語言）。
 * - 中文：直接用 reading.fortune
 * - 英文：有翻好的欄位用 fortuneEn，還沒翻的先顯示中文，並在背景呼叫翻譯 API 補上
 *   翻好就存進 Firestore，之後切換語言不會再打 API
 * 回傳的 reading.fortuneZh 永遠是中文主版本，給需要解析中文格式的元件（格局、用神標籤）
 */
export function useLocalizedReading(
  reading: Reading,
  neededKeys: TranslatableFortuneKey[],
  onUpdate: (updated: Reading) => void,
) {
  const { locale } = useLocale();
  const { getToken } = useAuth();
  const [failed, setFailed] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  const requestedRef = useRef(new Set<string>());

  // 中文有內容、英文還沒有的欄位
  const missing = useMemo(
    () =>
      locale === 'en'
        ? neededKeys.filter((key) => {
            const zh = reading.fortune[key];
            return typeof zh === 'string' && zh.trim() !== '' && !reading.fortuneEn?.[key];
          })
        : [],
    [locale, neededKeys, reading.fortune, reading.fortuneEn],
  );
  const missingKey = missing.join(',');

  const requestTranslation = useCallback(
    async (keys: TranslatableFortuneKey[]) => {
      if (keys.length === 0) return;
      setInFlight(true);
      setFailed(false);
      try {
        const token = await getToken();
        if (!token) throw new Error('not signed in');
        const res = await fetch(`/api/result/${reading.id}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ keys }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'translate failed');
        onUpdate({ ...reading, fortuneEn: data.fortuneEn });
      } catch (error) {
        console.error('Translate fortune failed:', error);
        setFailed(true);
      } finally {
        setInFlight(false);
      }
    },
    [getToken, onUpdate, reading],
  );

  // 每組欄位只自動請求一次，失敗就停下來等使用者按重試，避免一直重打
  useEffect(() => {
    if (!missingKey || inFlight) return;
    if (requestedRef.current.has(missingKey)) return;
    requestedRef.current.add(missingKey);
    void requestTranslation(missing);
  }, [missingKey, missing, inFlight, requestTranslation]);

  const retry = useCallback(() => {
    requestedRef.current.delete(missingKey);
    void requestTranslation(missing);
  }, [missing, missingKey, requestTranslation]);

  const displayReading = useMemo<Reading>(() => {
    if (locale === 'zh') return { ...reading, fortuneZh: reading.fortune };
    const merged: FortuneReading = { ...reading.fortune };
    for (const [key, value] of Object.entries(reading.fortuneEn ?? {})) {
      if (typeof value === 'string' && value) (merged as unknown as Record<string, string>)[key] = value;
    }
    return { ...reading, fortune: merged, fortuneZh: reading.fortune };
  }, [locale, reading]);

  return {
    reading: displayReading,
    /** 英文介面、有欄位還沒翻好（正在翻或翻失敗，畫面上先顯示中文） */
    pending: missing.length > 0,
    missing,
    translating: inFlight,
    failed: failed && missing.length > 0,
    retry,
  };
}
