'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import styles from './page.module.scss';
import { useAuth } from '../lib/auth-context';

const REVEALS = [
  { emoji: '🔮', label: '性格命格', desc: '天生個性、優勢與潛在盲點' },
  { emoji: '💰', label: '財運事業', desc: '求財時機與最適合的職涯方向' },
  { emoji: '🌸', label: '感情桃花', desc: '姻緣時機與感情相處的密碼' },
  { emoji: '🌿', label: '健康補運', desc: '身體弱點與專屬開運行動建議' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, readingId, readingLoading } = useAuth();

  useEffect(() => {
    if (loading || readingLoading || !user || !readingId) return;
    router.replace(`/result/${readingId}`);
  }, [user, loading, readingId, readingLoading, router]);

  const handleStart = () => {
    if (user && readingId) {
      router.push(`/result/${readingId}`);
    } else {
      router.push('/form');
    }
  };

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden bg-gradient-to-br from-[#FFFDF5] via-[#FFF9EE] to-[#FFF5E7] ${styles['bg-dots']}`}>
      {/* Background blobs - Larger, dynamic, and warm golden/amber tones */}
      <div className={`absolute top-[-10%] right-[-20%] w-[32rem] h-[32rem] md:w-[50rem] md:h-[50rem] bg-gradient-to-br from-[#FFF0C2] to-[#FFD475] opacity-50 mix-blend-multiply rounded-full blur-[80px] md:blur-[120px] pointer-events-none ${styles['animate-blob-1']}`} />
      <div className={`absolute bottom-[-10%] left-[-15%] w-[28rem] h-[28rem] md:w-[45rem] md:h-[45rem] bg-gradient-to-tr from-[#FFF7DF] to-[#FFE29E] opacity-45 mix-blend-multiply rounded-full blur-[80px] md:blur-[110px] pointer-events-none ${styles['animate-blob-2']}`} />
      <div className={`absolute top-[20%] left-[-10%] w-[22rem] h-[22rem] bg-[#FFECA9] opacity-35 mix-blend-multiply rounded-full blur-[70px] pointer-events-none ${styles['animate-blob-3']}`} />

      {/* Cosmic Orbit background decoration */}
      <div className={`absolute w-[36rem] h-[36rem] md:w-[52rem] md:h-[52rem] rounded-full border border-dashed border-[#FCD060]/15 pointer-events-none z-0 ${styles['animate-spin-slow']}`} />

      {/* Sparkling Stars (閃亮亮動畫) */}
      <svg className={`absolute top-[12%] left-[8%] md:left-[18%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
      </svg>
      <svg className={`absolute bottom-[18%] right-[6%] md:right-[15%] w-7 h-7 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.8s', animationDuration: '4.2s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
      </svg>
      <svg className={`absolute top-[8%] right-[12%] md:right-[22%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '1.6s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
      </svg>
      <svg className={`absolute top-[52%] left-[4%] md:left-[10%] w-6 h-6 text-[#FCD060] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '2.4s', animationDuration: '2.8s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
      </svg>
      <svg className={`absolute bottom-[10%] left-[15%] md:left-[25%] w-5 h-5 text-[#FFE8B6] pointer-events-none z-0 ${styles['animate-sparkle']}`} style={{ animationDelay: '0.4s', animationDuration: '3.2s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
      </svg>

      <div className="w-full max-w-lg space-y-10 relative z-10 p-6">
        {/* Hero */}
        <motion.div
          className="text-center space-y-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Tag */}
          <div className="flex justify-center">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#6B6159] border border-[#EAE5DF] rounded-full px-4 py-1.5 bg-white/60">
              八字命理 × AI 解析
            </span>
          </div>

          {/* Floating cat */}
          <motion.div
            className="flex justify-center relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 opacity-40 mix-blend-multiply flex items-center justify-center -z-10">
              <div
                className="w-44 h-44 bg-[#FCD060]"
                style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
              />
            </div>
            <Image
              src="/cats/bazi-cat-default.png"
              alt="八字命理"
              width={130}
              height={110}
              priority
              className={`relative z-10 ${styles['animate-float']}`}
            />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-[#4A4A4A] font-black text-4xl md:text-5xl tracking-[0.15em] leading-tight">
              你是哪一種
              <br />
              命格貓？
            </h1>
            <p className="text-[#636363] text-sm leading-relaxed max-w-xs mx-auto">
              輸入出生年月日，透過八字 × AI 解讀你天生的性格、運勢與人生密碼
            </p>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {REVEALS.map(({ emoji, label, desc }) => (
            <motion.div
              key={label}
              variants={item}
              className="bg-white/80 border border-[#EAE5DF] rounded-2xl p-4 space-y-1.5 text-left"
            >
              <span className="text-xl">{emoji}</span>
              <p className="font-bold text-sm text-[#4A4A4A] tracking-wide">{label}</p>
              <p className="text-[11px] text-[#6B6159] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <button
            onClick={handleStart}
            className="w-full bg-[#FCD060] text-[#4A4A4A] font-black py-4 rounded-2xl tracking-[0.2em] text-sm hover:bg-[#FDE49B] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all"
          >
            開始測算 ✦
          </button>
          <p className="text-[11px] text-[#857C74] tracking-wider">輸入資料約需 30 秒</p>
        </motion.div>
        </div>
      </div>
  );
}
