'use client';

import React, { useEffect, useState } from 'react';
import { Close, Facebook, Line } from '@/public/icon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[#2D1B1B]">分享到</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <Close className="w-6 h-6" />
          </button>
        </div>

        {/* Share Options */}
        <div className="flex justify-center gap-12 mb-10">
          {/* Facebook */}
          <button
            onClick={handleShareFacebook}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-gray-50 group-hover:scale-105 transition-all duration-300">
              <Facebook className="w-6 h-6 text-[#2D1B1B]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </button>

          {/* Line */}
          <button
            onClick={handleShareLine}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-gray-50 group-hover:scale-105 transition-all duration-300">
              <Line className="w-6 h-6 text-[#2D1B1B]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Line</span>
          </button>
        </div>

        {/* Link Input Box */}
        <div className="relative group">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 transition-all duration-300 focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-inner">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent text-gray-500 text-sm focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button
              onClick={handleCopyLink}
              className="text-[#2D1B1B] hover:text-gray-600 p-1 flex items-center justify-center relative"
              title="Copy link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>

              {/* Tooltip */}
              {copied && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2D1B1B] text-white text-[10px] py-1 px-2 rounded-md animate-in fade-in slide-in-from-bottom-1">
                  Copied!
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
