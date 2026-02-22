/* eslint-disable jsx-a11y/alt-text */
import { useState, type HTMLAttributes, type ImgHTMLAttributes } from 'react';
import { type SafeAny } from '@trg/utils';
import clsx from 'clsx';
export type ImageDetailProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  imageInfo: ImgHTMLAttributes<SafeAny>;
};

export function ImageDetail({
  imageInfo,
  className,
  ...props
}: ImageDetailProps) {
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove: ImageDetailProps['onMouseMove'] = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // 計算相對於容器的滑鼠位置百分比
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(50, Math.max(0, xPercent / 2));
    const y = Math.min(50, Math.max(0, yPercent / 2));

    setHoverPosition({ x, y });
  };

  return (
    <div
      className={clsx(
        'group/image-detail relative aspect-square rounded-lg md:overflow-hidden md:cursor-zoom-in',
        className,
      )}
      {...props}
    >
      <img
        className="size-full object-cover duration-300 md:group-hover/image-detail:opacity-0"
        {...imageInfo}
      />
      <div
        className="absolute top-0 left-0 size-[200%] bg-contain bg-center bg-no-repeat transition-opacity duration-300 hidden md:block md:opacity-0 md:group-hover/image-detail:opacity-100"
        style={{
          backgroundImage: `url(${imageInfo.src})`,
          translate: `${-hoverPosition.x}% ${-hoverPosition.y}%`,
        }}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}
