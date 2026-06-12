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
  { title: '什麼是日主', body: '日柱的天干代表「你自己」，是整張命盤的核心，其他干支都圍繞它論吉凶。' },
  { title: '五行相生', body: '木生火、火生土、土生金、金生水、水生木。五行之間循環相生，命盤中相生的組合往往帶來助力。' },
  { title: '五行相剋', body: '木剋土、土剋水、水剋火、火剋金、金剋木。相剋不一定代表壞事，有時是推動改變的力量。' },
  { title: '天干有十個', body: '甲乙（木）、丙丁（火）、戊己（土）、庚辛（金）、壬癸（水）。陽干主動外放，陰干柔和內斂。' },
  { title: '地支藏干', body: '每個地支底下藏有一到三個天干，稱為藏干。它們是命盤中隱藏的力量，影響深遠卻不易察覺。' },
  { title: '什麼是十神？', body: '以日主為基準，其他天干與日主的五行關係衍生出比肩、劫財、食神等十種星，各自代表不同的人事關係。' },
  { title: '大運每十年一換', body: '大運以十年為一個週期，代表人生各階段的整體氣場。起運年齡因人而異，通常在 3 到 9 歲之間。' },
  { title: '命好不如運好', body: '八字界有句話：「命好不如運好，運好不如歲好。」先天命格是底牌，但後天大運流年才是發揮的關鍵。' },
  { title: '日主喜忌', body: '日主旺則喜剋洩，日主弱則喜生扶。找出命盤中的喜用神，等於找到人生中最該借力的方向。' },
  { title: '時柱的作用', body: '時柱代表晚年運勢與子女緣分。填入出生時辰可讓命盤更完整，解讀也更準確。' },
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
