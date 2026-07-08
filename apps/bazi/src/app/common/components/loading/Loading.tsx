'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const STEPS = [
  '排四柱八字',
  '推算藏干十神',
  '分析大運流年',
  'AI 解讀命格',
  '生成完整報告',
];

const KNOWLEDGE = [
  { title: '什麼是日主', body: '你出生那天的天干，就代表「你自己」。整張命盤都是圍繞著這個「你」在看的。' },
  { title: '金生水', body: '金屬表面遇冷會凝出水珠，所以金生水。' },
  { title: '水生木', body: '樹要有水澆灌才長得大，所以水生木。' },
  { title: '木生火', body: '木頭是最好的柴火，一點就著，所以木生火。' },
  { title: '火生土', body: '東西燒成灰燼之後就變成了土，所以火生土。' },
  { title: '土生金', body: '金屬礦石都是從土裡、山裡挖出來的，所以土生金。' },
  { title: '金的人', body: '意志堅定、重義氣、做事有原則；但有時候太固執，不容易妥協。' },
  { title: '木的人', body: '善良、有生命力、喜歡成長和學習；但有時候太理想化，容易被現實打擊。' },
  { title: '水的人', body: '聰明、腦筋轉得快、適應力強；但有時候想法多變，不容易專一。' },
  { title: '火的人', body: '熱情、直率、行動力十足；但有時候脾氣急，做事不夠沉穩。' },
  { title: '土的人', body: '穩重、值得信賴、腳踏實地；但有時候太固守舊方法，不容易變通。' },
  { title: '命盤是說明書，不是判決書', body: '它告訴你天生的個性和傾向，你可以照著它走比較順的路，也可以選擇逆著走、闖出自己的路。看懂命盤不是要你認命，是讓你更清楚自己在選什麼。' },
];

export function Loading({ message = '正在解析命盤…' }: { message?: string }) {
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
              {allDone ? '命盤解析完成！' : '命盤\n解析中…'}
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
            <p className="text-[10px] text-[#A09587] font-bold tracking-widest uppercase">八字小知識</p>
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
        {message}
      </motion.p>
    </div>
  );
}
