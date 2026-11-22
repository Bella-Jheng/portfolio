'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { useLocale } from '../../../lib/i18n/locale-context';

/** 訪客體驗中，畫面最上方的小標籤：提醒是範例資料，可以隨時結束 */
export function DemoBadge() {
  const { isDemo, logout } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  if (!isDemo) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#2D2420]/90 py-1.5 pl-4 pr-1.5 text-xs text-white shadow-lg backdrop-blur">
        <span>{t('demo.badge')}</span>
        <button type="button" onClick={() => void logout().then(() => router.replace('/'))} className="rounded-full bg-white/20 px-3 py-1 font-medium">
          {t('demo.end')}
        </button>
      </div>
    </div>
  );
}
