'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LeaveHint } from './LeaveHint';
import { useLocale } from '../../../lib/i18n/locale-context';
import { LOADING_CONTENT } from '../../../lib/i18n/content';

export function Loading({
  message,
  canLeave = false,
  translating = false,
}: {
  message?: string;
  canLeave?: boolean;
  /** 英文介面排盤：中文主版本產生完後還要翻成英文，多顯示一個步驟 */
  translating?: boolean;
}) {
  const { locale, t } = useLocale();
  const { steps, knowledge: KNOWLEDGE } = LOADING_CONTENT[locale];
  const STEPS = translating ? [...steps, t('loading.translateStep')] : steps;
  const [stepIdx, setStepIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 6000);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const cardTimer = setInterval(() => {
      setCardIdx((prev) => (prev + 1) % KNOWLEDGE.length);
    }, 4000);
    return () => clearInterval(cardTimer);
  }, []);

  const card = KNOWLEDGE[cardIdx];
  const allDone = stepIdx >= STEPS.length - 1;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto relative overflow-hidden py-6">

      {/* Cat + blobs + title */}
      <div className="relative px-6 mb-6">
        {/* organic blobs */}
        <div className="absolute top-0 left-4 w-40 h-40 bg-[#FDE49B] rounded-full blur-2xl opacity-50 pointer-events-none" />
        <div className="absolute top-6 left-20 w-32 h-32 bg-[#FCD060] rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="flex items-end gap-0 relative z-10">
          {/* Cat */}
          <motion.div
            className="relative w-28 h-28 shrink-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
          >
            <Image
              src="/cats/loading-cat.png"
              alt="loading"
              width={112}
              height={112}
              priority
              className="drop-shadow-sm mix-blend-multiply"
            />
          </motion.div>

          {/* Title */}
          <div className="pb-2 pl-2">
            <motion.h2
              key={allDone ? 'done' : 'loading'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-[#2A2A2A] leading-snug"
            >
              {allDone ? t('loading.done') : t('loading.title')}
            </motion.h2>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full space-y-3.5 px-6 mb-6">
        {STEPS.map((step, index) => {
          const done = index < stepIdx;
          const active = index === stepIdx;
          const pending = index > stepIdx;
          return (
            <div key={step} className="flex items-center gap-3.5">
              {/* Circle icon */}
              <div className="shrink-0 w-5 h-5">
                {done || active ? (
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-5 h-5 rounded-full bg-[#4CAF50] flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#E8E4DF]" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-base font-bold tracking-wide transition-colors duration-300 ${
                  done || active ? 'text-[#4CAF50]' : pending ? 'text-[#C8BFB6]' : ''
                }`}
              >
                {step}
                {(done || active) && (
                  <span className="ml-1.5 text-[#4CAF50] opacity-60 font-normal tracking-widest">…</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#EAE5DF] mb-6" />

      {/* Knowledge card */}
      <div className="px-6 min-h-[100px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="space-y-2 bg-[#FFFDF5] rounded-2xl p-4 border border-[#EAE5DF]"
          >
            <p className="text-[10px] text-[#A09587] font-bold tracking-widest uppercase">{t('loading.tip')}</p>
            <p className="text-sm font-black text-[#4A4A4A] tracking-wide">{card.title}</p>
            <p className="text-sm text-[#6B6159] leading-relaxed">{card.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex gap-1 mt-4">
          {KNOWLEDGE.map((_, index) => (
            <div
              key={index}
              className="h-0.5 rounded-full transition-all duration-500"
              style={{
                width: index === cardIdx ? 16 : 4,
                backgroundColor: index === cardIdx ? '#FCD060' : '#EAE5DF',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom message */}
      <motion.p
        className="text-[10px] text-[#A09587] tracking-widest text-center mt-6 px-6"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      >
        {message ?? t('loading.default')}
      </motion.p>
      {/* 背景排盤時：提醒可以切走、開啟推播 */}
      {canLeave && <LeaveHint />}
    </div>
  );
}
