'use client';

import { useMemo } from 'react';
import styles from './StarField.module.scss';

interface StarData {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function StarField({ count = 30 }: { count?: number }) {
  const stars = useMemo<StarData[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 1 + seededRandom(i * 3) * 2,         // 1–3 px
      left: seededRandom(i * 7) * 100,             // 0–100 %
      duration: 4 + seededRandom(i * 11) * 6,     // 4–10 s
      delay: -(seededRandom(i * 13) * 10),         // stagger start
      drift: (seededRandom(i * 17) - 0.5) * 60,   // ±30 px horizontal drift
    }));
  }, [count]);

  return (
    <div className={styles.container} aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className={styles.star}
          style={{
            width: s.size,
            height: s.size,
            left: `${s.left}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            '--drift': `${s.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
