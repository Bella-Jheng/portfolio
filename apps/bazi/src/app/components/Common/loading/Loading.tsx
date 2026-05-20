'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function Loading({ message = '正在解析命盤…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 relative w-full overflow-hidden">
      {/* Decorative Background Blob */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FDE49B] opacity-40 mix-blend-multiply rounded-full blur-3xl pointer-events-none"
      />

      {/* Spinning Cat */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            ease: "linear", 
            repeat: Infinity 
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src="/cats/loading-cat.png"
            alt="loading spinner"
            width={100}
            height={100}
            priority
            className="drop-shadow-sm mix-blend-multiply opacity-90"
          />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.p
          className="text-[#4A4A4A] text-sm tracking-[0.2em] font-bold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
        >
          {message}
        </motion.p>
        
        {/* Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#FCD060]"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
