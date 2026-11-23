'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { useLocale } from '../../../lib/i18n/locale-context';
import type { MessageKey } from '../../../lib/i18n/messages';
import { INSTALL_STEP, ONBOARDED_KEY, useOnboardingStore } from '../../../lib/onboarding-store';
import { useInstallPrompt } from '../../../lib/install-prompt';
import { usePush } from '../../../lib/push-client';
import { localizeError } from '../../../lib/i18n/messages';

const INTRO_SLIDES: { emoji?: string; cat?: boolean; title: MessageKey; body: MessageKey }[] = [
  { cat: true, title: 'intro.s1Title', body: 'intro.s1Body' },
  { emoji: '🔮', title: 'intro.s2Title', body: 'intro.s2Body' },
  { emoji: '💬', title: 'intro.s3Title', body: 'intro.s3Body' },
];

// 這些頁面不自動跳介紹：管理員頁面，以及推播點進來的結果頁（已經是老用戶）
function skipAutoIntro(pathname: string): boolean {
  return ['/dashboard', '/knowledge', '/test'].some((p) => pathname.startsWith(p));
}

/**
 * 第一次進來的介紹：開場動畫結束後出現，三頁介紹 + 最後一頁請用戶把命格貓加到主畫面
 * （加到主畫面才能收到每月 1 號的運勢提醒和功能更新通知）。看過一次就不再自動出現，可以從「我的」重看。
 */
export function Onboarding() {
  const pathname = usePathname();
  const { open, step, splashDone, show, setStep, close } = useOnboardingStore();
  const { t } = useLocale();

  useEffect(() => {
    if (!splashDone || skipAutoIntro(pathname)) return;
    try {
      if (localStorage.getItem(ONBOARDED_KEY) === '1') return;
    } catch {
      return;
    }
    // 從推播或主畫面圖示打開的人已經是用戶了，不用再看介紹
    if (new URLSearchParams(window.location.search).has('tab')) return;
    show(0);
    // 開場動畫結束時檢查一次就好
  }, [splashDone]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  const isInstallStep = step >= INSTALL_STEP;
  const total = INTRO_SLIDES.length + 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="onboarding"
          role="dialog"
          aria-modal="true"
          aria-label={t('intro.aria')}
          className="fixed inset-0 z-[9500] flex flex-col bg-[#FFFDF5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end px-4 pt-[max(env(safe-area-inset-top),12px)]">
            <button type="button" onClick={close} className="min-h-[44px] px-3 text-sm text-[#6B6159]">
              {t('intro.skip')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center py-6 text-center"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {isInstallStep ? <InstallStep /> : <IntroSlide slide={INTRO_SLIDES[step]} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
            <div className="mx-auto max-w-sm">
              <div className="mb-5 flex justify-center gap-2" aria-hidden>
                {Array.from({ length: total }).map((_, i) => (
                  <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-5 bg-[#4A4A4A]' : 'w-2 bg-[#D8D2C8]'}`} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => (isInstallStep ? close() : setStep(step + 1))}
                className="min-h-[52px] w-full rounded-xl bg-[#FCD060] text-sm font-bold tracking-widest text-[#4A4A4A] shadow-sm"
              >
                {isInstallStep ? t('intro.done') : t('intro.next')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function IntroSlide({ slide }: { slide: (typeof INTRO_SLIDES)[number] }) {
  const { t } = useLocale();
  return (
    <>
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        <div aria-hidden className="absolute inset-0 bg-[#FCD060]/40" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
        {slide.cat ? (
          <img src="/cats/bazi-cat-default.webp" alt="" className="relative h-36 w-36 object-contain" />
        ) : (
          <span aria-hidden className="relative text-7xl">{slide.emoji}</span>
        )}
      </div>
      <h2 className="text-2xl font-black leading-snug text-[#2D2420]">{t(slide.title)}</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#6B5D57]">{t(slide.body)}</p>
    </>
  );
}

/** 最後一頁：加到主畫面的好處，依裝置顯示對應的做法 */
function InstallStep() {
  const { t, locale } = useLocale();
  const { user, getToken } = useAuth();
  const { platform, install } = useInstallPrompt();
  const { state, busy, error, enable } = usePush(getToken);

  return (
    <>
      <div className="relative mb-6 flex h-36 w-36 items-center justify-center">
        <div aria-hidden className="absolute inset-0 bg-[#FCD060]/40" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
        <img src="/apple-touch-icon.png" alt="" className="relative h-20 w-20 rounded-[22px] shadow-md" />
      </div>
      <h2 className="text-2xl font-black leading-snug text-[#2D2420]">{t('intro.installTitle')}</h2>
      <ul className="mt-4 w-full space-y-2 text-left text-sm text-[#4F433E]">
        <li className="flex gap-2 rounded-xl bg-white px-4 py-3 border border-[#EAE5DF]">
          <span aria-hidden>🌙</span>
          <span>{t('intro.benefitMonthly')}</span>
        </li>
        <li className="flex gap-2 rounded-xl bg-white px-4 py-3 border border-[#EAE5DF]">
          <span aria-hidden>✨</span>
          <span>{t('intro.benefitUpdates')}</span>
        </li>
      </ul>

      <div className="mt-5 w-full rounded-2xl bg-[#FFF8E0] px-4 py-4 text-left text-sm text-[#6B4E00]">
        {platform === 'installed' && (
          <>
            <p className="font-bold">{t('intro.installedTitle')}</p>
            {state === 'on' ? (
              <p className="mt-1">{t('intro.notifyOn')}</p>
            ) : user && state === 'off' ? (
              <button
                type="button"
                onClick={enable}
                disabled={busy}
                className="mt-3 min-h-[44px] w-full rounded-xl bg-[#4A4A4A] text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? t('leave.enabling') : t('intro.enableNotify')}
              </button>
            ) : (
              <p className="mt-1">{t('intro.notifyLater')}</p>
            )}
            {error && <p className="mt-2 text-xs text-[#B42318]">{localizeError(error, locale)}</p>}
          </>
        )}
        {platform === 'ios' && (
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>{t('intro.iosStep1')}</li>
            <li>{t('intro.iosStep2')}</li>
            <li>{t('intro.iosStep3')}</li>
          </ol>
        )}
        {platform === 'android-prompt' && (
          <button
            type="button"
            onClick={() => void install()}
            className="min-h-[44px] w-full rounded-xl bg-[#4A4A4A] text-sm font-bold text-white"
          >
            {t('intro.installButton')}
          </button>
        )}
        {platform === 'other' && <p>{t('intro.otherBrowser')}</p>}
      </div>
    </>
  );
}
