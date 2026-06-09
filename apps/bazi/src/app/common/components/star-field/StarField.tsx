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
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      size: 1 + seededRandom(index * 3) * 2,         // 1–3 px
      left: seededRandom(index * 7) * 100,             // 0–100 %
      duration: 4 + seededRandom(index * 11) * 6,     // 4–10 s
      delay: -(seededRandom(index * 13) * 10),         // stagger start
      drift: (seededRandom(index * 17) - 0.5) * 60,   // ±30 px horizontal drift
    }));
  }, [count]);

  return (
    <div className={styles.container} aria-hidden>
      {stars.map((star) => (
        <span
          key={star.id}
          className={styles.star}
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            '--drift': `${star.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
