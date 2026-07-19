'use client';

import React from 'react';

interface DownloadPDFProps {
  href: string;
  label: string;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export const DownloadPDF: React.FC<DownloadPDFProps> = ({ href, label }) => {
  return (
    <a
      href={href}
      download
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-txt-brown/15 bg-white/70 px-4 py-2.5 text-xs md:text-sm font-bold text-txt-darkBrown shadow-sm transition-all duration-300 min-w-[190px] hover:-translate-y-0.5 hover:border-[#5E7985]/40 hover:text-[#5E7985] hover:shadow-md"
    >
      <DownloadIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-y-0.5" />
      {label}
    </a>
  );
};
