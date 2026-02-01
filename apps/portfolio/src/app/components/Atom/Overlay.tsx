import React from 'react';

interface OverlayProps {
  className?: string;
  onClick?: () => void;
  zIndex?: number;
}

export const Overlay: React.FC<OverlayProps> = ({
  className = '',
  onClick,
  zIndex = 1000,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black/75 transition-opacity duration-300 ${className}`}
      style={{ zIndex }}
      onClick={onClick}
    />
  );
};
