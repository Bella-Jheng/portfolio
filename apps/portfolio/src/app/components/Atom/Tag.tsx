"use client";

import React from "react";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = "" }) => {
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-txt-brown bg-[#E6E4B4] rounded-2xl ${className}`}
    >
      {children}
    </span>
  );
};
