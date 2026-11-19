'use client';

import { useLocale } from '../../../lib/i18n/locale-context';

/** 英文介面：舊命盤或新產生的分析還沒有英文版時，先顯示中文，上方放這條提示 */
export function TranslationNotice({
  translating,
  failed,
  onRetry,
}: {
  translating: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className="px-2 md:px-6">
      <div
        role="status"
        className="max-w-2xl mx-auto flex items-center gap-2.5 rounded-xl bg-[#FFF8E0] text-[#6B4E00] px-3.5 py-2.5 text-sm font-semibold"
      >
        {failed ? (
          <>
            <span className="flex-1">{t('result.translateFailed')}</span>
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 min-h-[36px] px-3 rounded-full border border-[#6B4E00]/30 text-xs font-bold"
            >
              {t('result.retry')}
            </button>
          </>
        ) : (
          <>
            <svg
              className={`w-4 h-4 shrink-0 ${translating ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M21 12a9 9 0 11-6.2-8.56" />
            </svg>
            <span>{t('result.translating')}</span>
          </>
        )}
      </div>
    </div>
  );
}
