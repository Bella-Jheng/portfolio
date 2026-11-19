'use client';

import { useAuth } from '../../../lib/auth-context';
import { usePush } from '../../../lib/push-client';
import { useLocale } from '../../../lib/i18n/locale-context';
import { localizeError } from '../../../lib/i18n/messages';

/** 排盤 Loading 畫面下方：告訴使用者可以先切走，並提供開啟「算好時通知我」 */
export function LeaveHint() {
  const { getToken } = useAuth();
  const { state, busy, error, enable } = usePush(getToken);
  const { locale, t } = useLocale();

  const canNotify = state === 'on';
  return (
    <div className="mx-6 mt-6 rounded-2xl border border-[#EAE5DF] bg-white/70 p-4 text-sm leading-relaxed text-[#6B6159]">
      <p>
        {t('leave.text1')}<b className="text-[#4A4A4A]">{t('leave.text2')}</b>
        {canNotify ? t('leave.notify') : t('leave.noNotify')}
      </p>
      {state === 'off' && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-[#4A4A4A] py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? t('leave.enabling') : t('leave.enable')}
        </button>
      )}
      {state === 'needs-install' && (
        <p className="mt-2 text-xs">
          {t('leave.install')}
        </p>
      )}
      {state === 'denied' && <p className="mt-2 text-xs">{t('leave.denied')}</p>}
      {error && <p className="mt-2 text-xs text-[#B42318]">{localizeError(error, locale)}</p>}
    </div>
  );
}
