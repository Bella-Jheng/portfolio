'use client';

import React from 'react';
import { BlueFlower, BlackFlower, RedFlower } from '@/public/img';

interface LoadingScreenProps {
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        {/* Blue Flower */}
        <div className="animate-bounce-custom" style={{ animationDelay: '0s' }}>
          <img
            src={BlueFlower.src}
            alt=""
            className="w-10 h-10 md:w-14 md:h-14"
          />
        </div>
        {/* Black Flower */}
        <div
          className="animate-bounce-custom"
          style={{ animationDelay: '0.2s' }}
        >
          <img
            src={BlackFlower.src}
            alt=""
            className="w-10 h-10 md:w-14 md:h-14"
          />
        </div>
        {/* Red Flower */}
        <div
          className="animate-bounce-custom"
          style={{ animationDelay: '0.4s' }}
        >
          <img
            src={RedFlower.src}
            alt=""
            className="w-10 h-10 md:w-14 md:h-14"
          />
        </div>
      </div>

      <div className="flex items-end gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse delay-75"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse delay-150"></span>
        <h2 className="text-base md:text-lg font-bold text-gray-500 mx-2 tracking-widest">
          LOADING
        </h2>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse delay-150"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse delay-75"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse"></span>
      </div>

      <style jsx>{`
        @keyframes bounce-custom {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }
        .animate-bounce-custom {
          animation: bounce-custom 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
