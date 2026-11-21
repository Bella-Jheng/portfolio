'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useLocale } from '../../../lib/i18n/locale-context';
import { DEMO_LIMITS, isDemoEntry } from '../../../lib/demo/demo-config';

/** 訪客體驗按鈕：只有從 Demo 網址（?demo=1）進來、還沒登入時才出現；用 Firebase 匿名登入 */
export function DemoGuestButton({ className = '' }: { className?: string }) {
  const { user, loading, loginAsGuest } = useAuth();
  const { t } = useLocale();
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDemo(isDemoEntry()), []);
  if (!demo || loading || user) return null;
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await loginAsGuest();
          setBusy(false);
        }}
        className="border border-[#2D2420] bg-[#FCD060] text-[#2D2420] text-sm tracking-[0.18em] px-7 py-3 rounded-full shadow-md hover:bg-[#2D2420] hover:text-[#FCD060] transition-all duration-200 disabled:opacity-60"
      >
        {busy ? t('demo.starting') : t('demo.guest')}
      </button>
      <p className="max-w-xs text-center text-[11px] leading-relaxed text-[#6B5D57]">
        {t('demo.hint', { n: DEMO_LIMITS.questions })}
      </p>
    </div>
  );
}

/** 訪客體驗中，畫面最上方的小標籤：提醒是範例資料，可以隨時結束 */
export function DemoBadge() {
  const { isDemo, logout } = useAuth();
  const { t } = useLocale();
  if (!isDemo) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#2D2420]/90 py-1.5 pl-4 pr-1.5 text-xs text-white shadow-lg backdrop-blur">
        <span>{t('demo.badge')}</span>
        <button type="button" onClick={() => void logout()} className="rounded-full bg-white/20 px-3 py-1 font-medium">
          {t('demo.end')}
        </button>
      </div>
    </div>
  );
}
