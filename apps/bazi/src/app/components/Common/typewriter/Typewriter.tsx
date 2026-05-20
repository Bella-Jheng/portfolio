'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character, default 30
  className?: string;
}

export function Typewriter({ text, speed = 30, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);

    if (!text) {
      setDone(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
      } else {
        timer = setTimeout(tick, speed);
      }
    };

    timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="cursor-blink">|</span>}
    </span>
  );
}
