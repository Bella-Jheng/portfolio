'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectCard } from '../../components/Common/ProjectCard';
import { ProjectCardSkeleton } from '../../components/Common/ProjectCardSkeleton';
import { ProjectTabs } from '../../components/Atom/Tabs';
import { RevealOnScroll } from '../../components/Common/RevealOnScroll';

import { useProjects } from '../../api';
import { ProjectCategory } from '../../api/project-list-api.type';
import {
  Portfolio1,
  Portfolio2,
  Portfolio3,
  Portfolio4,
  Portfolio5,
} from '@/public/img';
console.log(
  Portfolio1.src,
  Portfolio2.src,
  Portfolio3.src,
  Portfolio4.src,
  Portfolio5.src,
);
const CATEGORIES: readonly ['全部', ...ProjectCategory[]] = [
  '全部',
  '前端專案',
  'PM 專案',
  '後端專案',
  '其他',
] as const;

type CategoryName = (typeof CATEGORIES)[number];

const CATEGORY_MAP: Record<string, CategoryName> = {
  all: '全部',
  frontend: '前端專案',
  pm: 'PM 專案',
  backend: '後端專案',
  other: '其他',
};

const ID_MAP: Record<CategoryName, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([id, name]) => [name, id]),
) as Record<CategoryName, string>;

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category') || 'all';

  const { data: projects = [] } = useProjects();

  const [activeCategory, setActiveCategory] = useState(
    CATEGORY_MAP[categoryId] || '全部',
  );
  const [isTabLoading, setIsTabLoading] = useState(false);

  useEffect(() => {
    const name = CATEGORY_MAP[categoryId];
    if (name && name !== activeCategory) {
      setActiveCategory(name);
    }
  }, [categoryId, activeCategory]);

  const handleCategoryChange = (name: string) => {
    const id = ID_MAP[name];
    if (id && id !== categoryId) {
      setIsTabLoading(true);
      router.push(`/projects?category=${id}`, { scroll: false });
      // Short delay to show skeleton and ensure smooth transition
      setTimeout(() => {
        setIsTabLoading(false);
      }, 600);
    }
  };

  const filteredProjects =
    activeCategory === '全部'
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F1F2CA] pt-24 md:pt-32 pb-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <header className="mb-8">
            <div className="flex items-start mb-4">
              <h2 className="text-4xl md:text-5xl font-black text-txt-brown tracking-tight">
                作品集
              </h2>
              <span className="text-xs md:text-sm text-gray-700 mt-1 ml-1">
                ({filteredProjects.length.toString().padStart(2, '0')})
              </span>
            </div>
          </header>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <ProjectTabs
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </RevealOnScroll>

        {/* Project Grid - 4 cards across on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isTabLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <ProjectCardSkeleton key={`skeleton-${index}`} />
              ))
            : filteredProjects.map((project, index) => (
                <RevealOnScroll
                  key={index}
                  delay={200 + index * 100}
                  className="h-full"
                >
                  <ProjectCard {...project} />
                </RevealOnScroll>
              ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
