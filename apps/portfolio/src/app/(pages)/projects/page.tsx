'use client';
import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectCard } from '../../components/Common/ProjectCard';
import { ProjectTabs } from '../../components/Atom/Tabs';
import { RevealOnScroll } from '../../components/Common/RevealOnScroll';

import { useProjects } from '../../api';
import { useLoadingStore } from '../../store/loading.store';

const CATEGORIES = ['全部', '特力集團（特力屋、HOLA）', '104人力銀行'];

const CATEGORY_MAP: Record<string, string> = {
  all: '全部',
  testrite: '特力集團（特力屋、HOLA）',
  '104': '104人力銀行',
};

const ID_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([id, name]) => [name, id]),
);

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category') || 'all';

  const { data: projects = [], isLoading } = useProjects();

  const [activeCategory, setActiveCategory] = React.useState(
    CATEGORY_MAP[categoryId] || '全部',
  );

  useEffect(() => {
    const name = CATEGORY_MAP[categoryId];
    if (name && name !== activeCategory) {
      setActiveCategory(name);
    }
  }, [categoryId, activeCategory]);

  const showLoading = useLoadingStore.use.showLoading();
  const closeLoading = useLoadingStore.use.closeLoading();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      closeLoading();
    }
  }, [isLoading, showLoading, closeLoading]);

  const handleCategoryChange = (name: string) => {
    const id = ID_MAP[name];
    if (id) {
      router.push(`/projects?category=${id}`, { scroll: false });
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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-txt-brown"></div>
          </div>
        ) : (
          /* Project Grid - 4 cards across on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProjects.map((project, index) => (
              <RevealOnScroll
                key={index}
                delay={200 + index * 100}
                className="h-full"
              >
                <ProjectCard {...project} />
              </RevealOnScroll>
            ))}
          </div>
        )}
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
