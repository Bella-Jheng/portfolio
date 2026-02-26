'use client';
import React from 'react';

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="relative h-full space-y-3 rounded-lg overflow-hidden bg-[#FBFBF2] border border-[#DEDDB8] before:absolute before:inset-0 before:-translate-x-full before:-skew-x-12 before:animate-lazyload before:border-t before:border-white/30 before:bg-gradient-to-r before:from-transparent before:via-white/75 before:to-transparent lg:space-y-4">
      {/* Image Skeleton */}
      <div className="aspect-video rounded-t-lg bg-gradient-to-r from-gray-100 to-gray-300"></div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-3 lg:space-y-4">
        {/* Title & Tags section */}
        <div className="space-y-2">
          {/* Tags simulation */}
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-300"></div>
            <div className="h-5 w-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-300"></div>
          </div>
          {/* Title */}
          <div className="h-8 lg:h-10 w-[80%] rounded-lg bg-gradient-to-r from-gray-100 to-gray-300"></div>
        </div>

        {/* Description simulation */}
        <div className="space-y-2">
          <div className="h-5 lg:h-6 w-[95%] rounded-lg bg-gradient-to-r from-gray-100 to-gray-300"></div>
          <div className="h-5 lg:h-6 w-[75%] rounded-lg bg-gradient-to-r from-gray-100 to-gray-300"></div>
        </div>

        {/* Action Link simulation */}
        <div className="pt-4">
          <div className="h-5 w-[30%] rounded-lg bg-gradient-to-r from-gray-100 to-gray-300"></div>
        </div>
      </div>
    </div>
  );
};
