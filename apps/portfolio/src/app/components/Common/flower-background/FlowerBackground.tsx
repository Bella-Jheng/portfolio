'use client';

import React, { useState, useEffect } from 'react';
import { BlueFlower, BlackFlower } from '@/public/img';

const FLOWERS = [
  {
    id: 'flower-1',
    type: 'black',
    className:
      'top-[15%] left-[10%] md:top-[12%] md:left-[18%] md:w-10 w-8 md:h-10 h-8 opacity-80',
  },
  {
    id: 'flower-2',
    type: 'blue',
    className:
      'top-[18%] right-[12%] md:top-[8%] md:right-[25%] md:w-26 w-20 md:h-26 h-20',
  },
  {
    id: 'flower-3',
    type: 'black',
    className:
      'top-[55%] left-[15%] md:top-[45%] md:left-[22%] md:w-8 w-6 md:h-8 h-6 opacity-70',
  },
  {
    id: 'flower-4',
    type: 'blue',
    className:
      'bottom-[15%] left-[8%] md:bottom-[25%] md:left-[20%] md:w-28 w-24 md:h-28 h-24',
  },
  {
    id: 'flower-5',
    type: 'black',
    className:
      'top-[40%] right-[8%] md:top-[30%] md:right-[20%] md:w-10 w-8 md:h-10 h-8 opacity-80',
  },
  {
    id: 'flower-6',
    type: 'blue',
    className:
      'top-[35%] left-[25%] md:top-[30%] md:right-[20%] w-16 h-16 md:w-20 md:h-20',
  },
  {
    id: 'flower-7',
    type: 'black',
    className:
      'bottom-[30%] right-[10%] md:bottom-[35%] md:right-[18%] md:w-8 w-6 md:h-8 h-6 opacity-80',
  },
  {
    id: 'flower-8',
    type: 'black',
    className:
      'bottom-[12%] left-[30%] md:bottom-[38%] md:left-[55%] md:w-10 w-8 md:h-10 h-8 opacity-80',
  },
  {
    id: 'flower-9',
    type: 'blue',
    className:
      'bottom-[5%] right-[15%] md:top-[50%] md:right-[10%] w-6 h-6 md:w-16 md:h-16',
  },
  {
    id: 'flower-10',
    type: 'black',
    className:
      'bottom-[38%] left-[60%] md:bottom-[50%] md:left-[15%] md:w-8 w-6 md:h-8 h-6 opacity-80',
  },
];

interface FlowerBackgroundProps {
  scrollY: number;
  isLoaded: boolean;
}

export const FlowerBackground: React.FC<FlowerBackgroundProps> = ({
  scrollY,
  isLoaded,
}) => {
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto rotate flowers
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % FLOWERS.length;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate specific flower transform (Spread and Magnify)
  const getFlowerTransform = (index: number) => {
    const directions = [
      { x: -0.8, y: -0.8 }, // 0: Top-Left
      { x: 0.8, y: -0.8 }, // 1: Top-Right
      { x: -0.9, y: 0.2 }, // 2: Mid-Left
      { x: -0.6, y: 0.8 }, // 3: Bottom-Left
      { x: 0.9, y: -0.2 }, // 4: Mid-Right
      { x: 0.8, y: 0.5 }, // 5: Mid-Right-Lower
      { x: 0.2, y: 0.9 }, // 6: Bottom-Center
      { x: -0.5, y: -0.9 }, // 7: Extra
      { x: 0.9, y: 0.1 }, // 8: Extra
      { x: -0.2, y: -0.8 }, // 9: Extra
    ];

    const dir = directions[index] || { x: 0, y: 0 };
    const spreadFactor = 0.5; // Adjust ease of spreading

    // Side-to-side entrance offset: move flowers from left or right based on their horizontal direction
    // Overrides: Specific directions for flower-2 (index 1) and flower-6 (index 5)
    let entranceOffsetX = isLoaded ? 0 : dir.x > 0 ? 1500 : -1500;
    if (!isLoaded) {
      if (index === 1) entranceOffsetX = 1500; // flower-2 from right
      if (index === 5) entranceOffsetX = -1500; // flower-6 from left
    }

    const translateX = scrollY * dir.x * spreadFactor + entranceOffsetX;
    const translateY = scrollY * dir.y * spreadFactor;

    // Scale up slowly with scroll, and start LARGE if not loaded (shrink effect)
    const baseScale = isLoaded ? 1 : 5;
    const scale = baseScale + scrollY * 0.0015;

    const isAutoRotating = rotatingIndex === index;
    const isHovered = hoveredIndex === index;
    const rotation = (isAutoRotating ? 180 : 0) + (isHovered ? 180 : 0);

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
      transition: isLoaded
        ? 'transform 1.5s ease-out, opacity 1.5s ease-out' // Faster, smoother, and synchronized transitions
        : 'transform 0.1s ease-out, opacity 0.1s ease-out',
      opacity: isLoaded ? 1 : 0,
    };
  };

  return (
    <div
      id="flowerContainer"
      className="absolute inset-0 z-0 pointer-events-none"
    >
      {FLOWERS.map((flower, index) => (
        <img
          id={flower.id}
          key={flower.id}
          src={flower.type === 'black' ? BlackFlower.src : BlueFlower.src}
          alt=""
          className={`absolute select-none pointer-events-auto cursor-pointer ${
            flower.className
          }`}
          style={getFlowerTransform(index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      ))}
    </div>
  );
};
