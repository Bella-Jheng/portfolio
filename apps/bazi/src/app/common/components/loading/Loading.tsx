'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const STEPS = [
  '排四柱八字…',
  '推算藏干十神…',
  '分析大運流年…',
  'AI 解讀命格…',
  '生成完整報告…',
];

const KNOWLEDGE = [
  { title: '什麼是日柱？', body: '八字由年、月、日、時四柱組成，其中「日柱」的天干稱為日主，代表你本人，是解讀命盤的核心。' },
  { title: '五行相生', body: '木生火、火生土、土生金、金生水、水生木。五行之間循環相生，命盤中相生的組合往往帶來助力。' },
  { title: '五行相剋', body: '木剋土、土剋水、水剋火、火剋金、金剋木。相剋不一定代表壞事，有時是推動改變的力量。' },
  { title: '天干有十個', body: '甲乙（木）、丙丁（火）、戊己（土）、庚辛（金）、壬癸（水）。大寫為陽干，小寫為陰干，各有不同性格。' },
  { title: '地支藏干', body: '每個地支底下藏有一到三個天干，稱為藏干。它們是命盤中隱藏的力量，影響深遠卻不易察覺。' },
  { title: '什麼是十神？', body: '以日主為基準，其他天干與日主的五行關係，衍生出比肩、劫財、食神、傷官、偏財、正財、七殺、正官、偏印、正印十種星。' },
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

  return (
    <div className="flex flex-col items-center gap-8 py-10 w-full max-w-sm mx-auto relative overflow-hidden">
      {/* Background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FDE49B] opacity-30 mix-blend-multiply rounded-full blur-3xl pointer-events-none" />

      {/* Cat */}
      <div className="relative w-24 h-24 shrink-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src="/cats/loading-cat.png"
            alt="loading"
            width={88}
            height={88}
            priority
            className="drop-shadow-sm mix-blend-multiply opacity-90"
          />
        </motion.div>
      </div>

      {/* Progress steps */}
      <div className="w-full space-y-2">
        {STEPS.map((step, index) => {
          const done = index < stepIdx;
          const active = index === stepIdx;
          return (
            <div key={step} className="flex items-center gap-3">
              <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[#7AC97A] text-sm font-black"
                  >
                    ✓
                  </motion.span>
                ) : active ? (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[#FCD060]"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#EAE5DF]" />
                )}
              </div>
              <span
                className={`text-xs tracking-wide transition-all duration-300 ${
                  active ? 'text-[#4A4A4A] font-bold' : done ? 'text-[#7AC97A] font-medium' : 'text-[#C8BFB6]'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#EAE5DF]" />

      {/* Knowledge card */}
      <div className="w-full min-h-[90px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] text-[#A09587] font-bold tracking-widest uppercase">八字小知識</p>
            <p className="text-xs font-black text-[#4A4A4A] tracking-wide">{card.title}</p>
            <p className="text-xs text-[#6B6159] leading-relaxed">{card.body}</p>
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
        className="text-[10px] text-[#A09587] tracking-widest"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}
