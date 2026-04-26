'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ProjectCard,
  ProjectCardSkeleton,
} from '../../components/Common/project-card';
import { ProjectTabs } from '../../components/Atom/Tabs';
import { RevealOnScroll } from '../../components/Common/reveal-on-scroll';

import { useProjects } from '../../api';
import { useLanguage } from '../../hooks/use-language';
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
const CATEGORIES_ZH = ['全部', '前端專案', 'PM 專案', '後端專案', '其他'] as const;
const CATEGORIES_EN = ['All', 'Frontend', 'PM', 'Backend', 'Other'] as const;

const CATEGORY_MAP: Record<string, string> = {
  all: 'all',
  frontend: '前端專案',
  pm: 'PM 專案',
  backend: '後端專案',
  other: '其他',
};

function ProjectsContent() {
  const { isEn } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category') || 'all';

  const { data: projects = [] } = useProjects();

  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const categories = isEn ? CATEGORIES_EN : CATEGORIES_ZH;

  useEffect(() => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
    }
  }, [categoryId, activeCategory]);

  const handleCategoryChange = (label: string) => {
    const index = (categories as readonly string[]).indexOf(label);
    const id = Object.keys(CATEGORY_MAP)[index];
    
    if (id && id !== categoryId) {
      setIsTabLoading(true);
      router.push(`/projects?category=${id}`, { scroll: false });
      setTimeout(() => {
        setIsTabLoading(false);
      }, 600);
    }
  };

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((project) => project.category === CATEGORY_MAP[activeCategory]);

  return (
    <div className="min-h-screen bg-[#F1F2CA] pt-24 md:pt-32 pb-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <header className="mb-8">
            <div className="flex items-start mb-4">
              <h2 className="text-4xl md:text-5xl font-black text-txt-brown tracking-tight">
                {isEn ? 'Projects' : '作品集'}
              </h2>
              <span className="text-xs md:text-sm text-gray-700 mt-1 ml-1">
                ({filteredProjects.length.toString().padStart(2, '0')})
              </span>
            </div>
          </header>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <ProjectTabs
            categories={categories}
            activeCategory={categories[Object.keys(CATEGORY_MAP).indexOf(activeCategory)]}
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
