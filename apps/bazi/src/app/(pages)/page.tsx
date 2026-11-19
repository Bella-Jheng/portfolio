'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useModalStore } from '../lib/modal-store';
import styles from './page.module.scss';
import { useLocale } from '../lib/i18n/locale-context';
import { HOME_CONTENT } from '../lib/i18n/content';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, isAdmin, readingId, readingLoading, login } =
    useAuth();
  const { show } = useModalStore();
  const { locale, t } = useLocale();
  const { taglines: TAGLINES, steps: STEPS, authorNote: AUTHOR_NOTE, features: FEATURES } = HOME_CONTENT[locale];

  useEffect(() => {
    if (loading || readingLoading || !user || isAdmin) return;
    if (readingId) router.replace(`/result/${readingId}`);
  }, [user, loading, isAdmin, readingId, readingLoading, router]);

  const handleStart = () => {
    if (loading || readingLoading) return;
    if (!user) {
      show({
        title: t('home.loginTitle'),
        message: t('home.loginMessage'),
        confirmLabel: t('common.googleLogin'),
        cancelLabel: t('common.cancel'),
        onConfirm: () => login('/form'),
      });
      return;
    }
    router.push(isAdmin || !readingId ? '/form' : `/result/${readingId}`);
  };

  return (
    <>
      <div className={`relative h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-white via-[#FFFEFC] to-[#FFFCF5] md:from-[#FFFDF5] md:via-[#FFF9EE] md:to-[#FFF5E7] ${styles['bg-dots']}`}>

        {/* Background blobs */}
        <div className={`absolute top-[-10%] right-[-20%] w-[16rem] h-[16rem] md:w-[50rem] md:h-[50rem] bg-gradient-to-br from-[#FFF0C2] to-[#FFD475] opacity-50 mix-blend-multiply rounded-full blur-[80px] md:blur-[120px] pointer-events-none ${styles['animate-blob-1']}`} />
        <div className={`absolute bottom-[-10%] left-[-15%] w-[14rem] h-[14rem] md:w-[45rem] md:h-[45rem] bg-gradient-to-tr from-[#FFF7DF] to-[#FFE29E] opacity-45 mix-blend-multiply rounded-full blur-[80px] md:blur-[110px] pointer-events-none ${styles['animate-blob-2']}`} />
        <div className={`absolute top-[20%] left-[-10%] w-[12rem] h-[12rem] md:w-[22rem] md:h-[22rem] bg-[#FFECA9] opacity-35 mix-blend-multiply rounded-full blur-[70px] pointer-events-none ${styles['animate-blob-3']}`} />

        {/* Site tagline — centered on mobile, top-left on desktop */}
        <div className="absolute top-[12%] md:top-6 left-0 right-0 md:left-8 md:right-auto z-20 select-none text-center md:text-left">
          <p className="text-xl md:text-sm font-medium text-[#2D2420] tracking-wide leading-snug">
            {t('home.welcome')}
          </p>
          <p className="text-xs text-[#999] tracking-wide mt-0.5">
            {t('home.by')}
          </p>
        </div>

        {/* Sparkling stars */}
        <svg className={`absolute top-[12%] left-[8%] md:left-[18%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
        <svg className={`absolute bottom-[18%] right-[6%] md:right-[15%] w-7 h-7 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.8s', animationDuration: '4.2s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
        <svg className={`absolute top-[8%] right-[12%] md:right-[22%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '1.6s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
        <svg className={`absolute top-[52%] left-[4%] md:left-[10%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '2.4s', animationDuration: '2.8s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
        <svg className={`absolute bottom-[10%] left-[15%] md:left-[25%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.4s', animationDuration: '3.2s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>

        {/* Scroll indicator — centered, bottom */}
        <div className="absolute bottom-1 md:bottom-[22%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 md:gap-2 select-none pointer-events-none">
          <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-[#8A8577]">SCROLL</span>
          <motion.div
            className="flex flex-col items-center -space-y-2.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="w-6 h-6 text-[#8A8577]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
            <svg className="w-6 h-6 text-[#8A8577]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </div>

        {/* Right: taglines + CTA — desktop only */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-end gap-2.5 z-20">
          {TAGLINES.map((line, index) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.35 + index * 0.14,
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="text-sm text-[#2D2420] tracking-wider"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Floating cat with blob */}
        <div className="absolute inset-0 flex items-center justify-center pb-[120px] md:pb-[180px]">
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Organic blob behind cat */}
            <div
              className="absolute w-48 h-48 md:w-96 md:h-96 bg-[#FCD060] opacity-40 mix-blend-multiply"
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
            />
            <Image
              src="/cats/bazi-cat-default.webp"
              alt={t('home.catAlt')}
              width={320}
              height={320}
              priority
              sizes="(max-width: 768px) 140px, 340px"
              className="relative z-10 w-[140px] h-[140px] md:w-[340px] md:h-[340px]"
            />
          </motion.div>
        </div>

        {/* Desktop: single-line oversized title at bottom */}
        <div className="hidden md:block absolute bottom-0 left-0 z-20 overflow-hidden pointer-events-none w-full">
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className={`${locale === 'en' ? 'text-[10vw]' : 'text-[13vw]'} font-normal leading-none tracking-tight text-[#1A1A1A] whitespace-nowrap pl-3`}
          >
            {t('home.desktopTitle')}
          </motion.h1>
        </div>

        {/* Mobile: two-line title */}
        <div className="md:hidden absolute bottom-[15%] left-0 z-20 w-full flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className={`${locale === 'en' ? 'text-[10.5vw] leading-[1.05]' : 'text-[12vw] leading-none'} text-[#1A1A1A] text-center pointer-events-none overflow-hidden w-full`}
          >
            <span className="block">{t('home.titleLine1')}</span>
            <span className="block">{t('home.titleLine2')}</span>
          </motion.h1>
        </div>
      </div>

      {/* Author's note */}
      <section className="bg-gradient-to-b from-[#FFF8EC] to-white px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            >
              <span className="block text-6xl md:text-7xl leading-none text-[#FCD060] select-none" aria-hidden>
                “
              </span>
              <p className="mt-2 text-2xl md:text-3xl font-medium text-[#2D2420] tracking-wide">
                {t('home.noteTitle')}
              </p>
            </motion.div>

            <div className="mt-8 md:mt-10 space-y-5 text-sm md:text-base leading-relaxed text-[#6B5D57]">
              {AUTHOR_NOTE.map((paragraph, index) => (
                <motion.p
                  key={paragraph[0]}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.08, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                  {paragraph.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-10 flex items-center gap-3"
            >
              <Image src="/cats/bazi-cat-default.webp" alt="" width={32} height={32} />
              <p className="text-xs tracking-[0.3em] text-[#B9985A]">{t('home.noteSign')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#B9985A] font-medium">{t('home.stepsLabel')}</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-medium text-[#2D2420]">{t('home.stepsTitle')}</h2>
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-5">
                <span className="text-4xl shrink-0">{step.emoji}</span>
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#B9985A]">{step.num}</p>
                  <h3 className="mt-1 text-lg font-medium text-[#2D2420]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B5D57]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature overview */}
      <section className="bg-gradient-to-b from-[#FFFDF5] to-[#FFF9EE] px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#B9985A] font-medium">{t('home.featuresLabel')}</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-medium text-[#2D2420]">{t('home.featuresTitle')}</h2>
          <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/70 border border-black/5 rounded-2xl p-5 md:p-6 hover:bg-white transition-colors duration-200"
              >
                <span className="text-2xl md:text-3xl">{feature.emoji}</span>
                <h3 className="mt-3 text-sm md:text-base font-medium text-[#2D2420]">{feature.title}</h3>
                <p className="mt-1 text-xs md:text-sm leading-relaxed text-[#6B5D57]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-white px-6 md:px-8 py-16 md:py-24 text-center">
        <p className="text-lg md:text-xl text-[#2D2420]">{t('home.ctaText')}</p>
        <button
          onClick={handleStart}
          className="mt-6 border border-[#2D2420] bg-[#2D2420] text-[#EDEBE4] text-sm tracking-[0.22em] px-8 py-3 cursor-pointer hover:bg-transparent hover:text-[#2D2420] transition-all duration-200"
        >
          {t('home.cta')}
        </button>
      </section>
    </>
  );
}
