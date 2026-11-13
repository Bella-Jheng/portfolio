'use client';

import clsx from 'clsx';
import { useListings } from '../lib/store';
import { FAVORITE_COLOR, type Listing } from '../lib/types';
import { HeartIcon, HeartOutlineIcon } from './icons';

/** 最想要的愛心開關：實心＝最想要，空心＝沒有 */
export function FavoriteButton({ listing, size = 22, className }: { listing: Listing; size?: number; className?: string }) {
  const toggleFavorite = useListings((s) => s.toggleFavorite);
  const on = !!listing.favorite;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? '取消最想要' : '設為最想要'}
      title={on ? '取消最想要' : '設為最想要'}
      onClick={(e) => {
        // 放在卡片連結裡時，按愛心不要跳到物件頁
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listing.id);
      }}
      className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', !on && 'text-sub', className)}
      style={on ? { color: FAVORITE_COLOR } : undefined}
    >
      {on ? <HeartIcon size={size} /> : <HeartOutlineIcon size={size} />}
    </button>
  );
}
