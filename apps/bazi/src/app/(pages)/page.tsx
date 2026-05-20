'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BirthForm } from '../components/Common/birth-form/BirthForm';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-start px-5 pt-10 pb-16 relative overflow-hidden bg-[#FFFDF5]">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-[-10%] w-96 h-96 bg-[#FDE49B] opacity-40 mix-blend-multiply rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-72 h-72 bg-[#FDE49B] opacity-30 mix-blend-multiply rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-10 relative z-10">
        {/* ── Hero ── */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="flex justify-center relative mb-6"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Background Blob */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply flex items-center justify-center -z-10">
              <div
                className="w-48 h-48 bg-[#FCD060]"
                style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
              />
            </div>
            <Image
              src="/logo-nobg.png"
              alt="八字命理 Logo"
              width={180}
              height={180}
              priority
              className="relative z-10"
            />
          </motion.div>

          {/* Decorative SVG squiggles */}
          <div className="flex justify-center -mt-8 mb-4">
            <svg
              className="w-24 h-12 opacity-60"
              viewBox="0 0 100 40"
              fill="none"
              stroke="#4A4A4A"
              strokeWidth="1.5"
            >
              <path d="M10,20 Q25,0 40,20 T70,20 T90,40" />
            </svg>
          </div>

          <h1 className="text-[#4A4A4A] font-black text-5xl tracking-[0.2em] mb-2">
            八字命理
          </h1>
          <p className="text-[#9E9E9E] font-serif italic text-sm tracking-widest">
            Bazi Destiny Analysis
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 text-[#4A4A4A] text-xs font-bold tracking-widest opacity-60">
            <span>運勢</span>
            <span>·</span>
            <span>感情</span>
            <span>·</span>
            <span>健康</span>
            <span>·</span>
            <span>事業</span>
          </div>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <BirthForm />
        </motion.div>
      </div>
    </div>
  );
}
