'use client';

import { motion } from 'framer-motion';
import styles from './PillarCard.module.scss';

interface PillarCardProps {
  stem: string;
  branch: string;
  element: string;
  label: string;
  delay?: number;
}

type ElementTheme = 'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'default';

function getElementTheme(element: string): ElementTheme {
  const first = element.charAt(0);
  if (first === '木') return 'wood';
  if (first === '火') return 'fire';
  if (first === '土') return 'earth';
  if (first === '金') return 'metal';
  if (first === '水') return 'water';
  return 'default';
}

function getHoverGlow(theme: ElementTheme): string {
  const glows: Record<ElementTheme, string> = {
    wood:    '0 4px 20px rgba(122, 201, 122, 0.3)',
    fire:    '0 4px 20px rgba(232, 120, 120, 0.3)',
    earth:   '0 4px 20px rgba(212, 168, 48, 0.3)',
    metal:   '0 4px 20px rgba(200, 144, 10, 0.3)',
    water:   '0 4px 20px rgba(144, 112, 192, 0.3)',
    default: '0 4px 20px rgba(201, 168, 76, 0.25)',
  };
  return glows[theme];
}

export function PillarCard({ stem, branch, element, label, delay = 0 }: PillarCardProps) {
  const theme = getElementTheme(element);

  return (
    <motion.div
      className={`${styles.card} ${styles[theme]}`}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 18,
        delay,
      }}
      style={{ perspective: 800 }}
      whileHover={{
        scale: 1.04,
        boxShadow: getHoverGlow(theme),
      }}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.stem}>{stem}</div>
      <div className={styles.branch}>{branch}</div>
      <div className={styles.elementLabel}>{element}</div>
    </motion.div>
  );
}
