import React from 'react';

const HIGHLIGHT_PATTERN = /\{\{(.+?)\}\}/g;

export function highlightText(text: string): React.ReactNode {
  const parts = text.split(HIGHLIGHT_PATTERN);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-txt-red font-semibold">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
