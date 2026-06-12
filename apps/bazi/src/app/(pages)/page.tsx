'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useModalStore } from '../lib/modal-store';
import styles from './page.module.scss';

const TAGLINES = ['用天干地支解讀', '你天生的個性與命格', '命格貓八字解析'];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, isAdmin, readingId, readingLoading, login } =
    useAuth();
  const { show } = useModalStore();

  useEffect(() => {
    if (loading || readingLoading || !user || !readingId || isAdmin) return;
    router.replace(`/result/${readingId}`);
  }, [user, loading, isAdmin, readingId, readingLoading, router]);

  const handleStart = () => {
    if (loading || readingLoading) return;
    if (!user) {
      show({
        title: '請先登入',
        message:
          '需要登入 Google 帳號才能開始排盤，系統會將你的命盤與帳號綁定，方便下次直接查看。',
        confirmLabel: 'Google 登入',
        cancelLabel: '取消',
        onConfirm: login,
      });
      return;
    }
    router.push(isAdmin || !readingId ? '/form' : `/result/${readingId}`);
  };

  return (
    <div className={`relative h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-white via-[#FFFEFC] to-[#FFFCF5] md:from-[#FFFDF5] md:via-[#FFF9EE] md:to-[#FFF5E7] ${styles['bg-dots']}`}>

      {/* Background blobs */}
      <div className={`absolute top-[-10%] right-[-20%] w-[16rem] h-[16rem] md:w-[50rem] md:h-[50rem] bg-gradient-to-br from-[#FFF0C2] to-[#FFD475] opacity-50 mix-blend-multiply rounded-full blur-[80px] md:blur-[120px] pointer-events-none ${styles['animate-blob-1']}`} />
      <div className={`absolute bottom-[-10%] left-[-15%] w-[14rem] h-[14rem] md:w-[45rem] md:h-[45rem] bg-gradient-to-tr from-[#FFF7DF] to-[#FFE29E] opacity-45 mix-blend-multiply rounded-full blur-[80px] md:blur-[110px] pointer-events-none ${styles['animate-blob-2']}`} />
      <div className={`absolute top-[20%] left-[-10%] w-[12rem] h-[12rem] md:w-[22rem] md:h-[22rem] bg-[#FFECA9] opacity-35 mix-blend-multiply rounded-full blur-[70px] pointer-events-none ${styles['animate-blob-3']}`} />

      {/* Site tagline — centered on mobile, top-left on desktop */}
      <div className="absolute top-[12%] md:top-6 left-0 right-0 md:left-8 md:right-auto z-20 select-none text-center md:text-left">
        <p className="text-xl md:text-sm font-medium text-[#2D2420] tracking-wide leading-snug">
          歡迎來到命格貓的世界
        </p>
        <p className="text-xs text-[#999] tracking-wide mt-0.5">
          by AI × 八字天干地支解析
        </p>
      </div>

      {/* Sparkling stars */}
      <svg className={`absolute top-[12%] left-[8%] md:left-[18%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
      <svg className={`absolute bottom-[18%] right-[6%] md:right-[15%] w-7 h-7 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.8s', animationDuration: '4.2s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
      <svg className={`absolute top-[8%] right-[12%] md:right-[22%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '1.6s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
      <svg className={`absolute top-[52%] left-[4%] md:left-[10%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '2.4s', animationDuration: '2.8s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>
      <svg className={`absolute bottom-[10%] left-[15%] md:left-[25%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.4s', animationDuration: '3.2s' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" /></svg>

      {/* Left: scroll indicator — desktop only */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 z-20 select-none pointer-events-none">
        <span
          className="text-[10px] tracking-[0.28em] text-[#999]"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          ( scroll )
        </span>
        <div className="w-px h-12 bg-[#bbb]" />
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
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          onClick={handleStart}
          className="mt-3 border border-[#2D2420] bg-[#2D2420] text-[#EDEBE4] text-xs tracking-[0.22em] px-5 py-2 hover:bg-transparent hover:text-[#2D2420] transition-all duration-200 cursor-pointer"
        >
          開始測算 →
        </motion.button>
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
            src="/cats/bazi-cat-default.png"
            alt="命格貓"
            width={320}
            height={320}
            priority
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
          className="text-[13vw] font-normal leading-none tracking-tight text-[#1A1A1A] whitespace-nowrap pl-3"
        >
          命格貓 × 八字
        </motion.h1>
      </div>

      {/* Mobile: two-line title + CTA */}
      <div className="md:hidden absolute bottom-[15%] left-0 z-20 w-full flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="text-[12vw] leading-none text-[#1A1A1A] text-center pointer-events-none overflow-hidden w-full"
        >
          <span className="block">你是哪一種</span>
          <span className="block">命格貓？</span>
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          onClick={handleStart}
          className="mt-6 border border-[#2D2420] bg-[#2D2420] text-[#EDEBE4] text-sm tracking-[0.22em] px-8 py-3 whitespace-nowrap cursor-pointer hover:bg-transparent hover:text-[#2D2420] transition-all duration-200"
        >
          開始測算 ✦
        </motion.button>
      </div>
    </div>
  );
}
