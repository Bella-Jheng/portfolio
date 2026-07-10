'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gallery as ProjectGallery } from '../../../components/Common/gallery';
import { Tag } from '../../../components/Atom/Tag';
import { Heart, HeartFilled, Share, ExternalLink } from '@/public/icon';
import { ShareModal } from '../../../components/Common/share-modal';
import { RevealOnScroll } from '../../../components/Common/reveal-on-scroll';
import { ProjectDetailTabs } from '../../../components/Common/project-sections/ProjectDetailTabs';
import { ProjectSlider } from '../../../components/Common/project-slider';
import { useProjectDetail } from '../../../api/project-detail-api';
import { useProjects } from '../../../api/project-list-api';
import { useLanguage } from '../../../hooks/use-language';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { isEn } = useLanguage();
  const { slug } = React.use(params);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { data: project, isLoading, error } = useProjectDetail(slug);
  const { data: allProjects = [] } = useProjects();
  const otherProjects = allProjects.filter((item) => item.id !== project?.id);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  if (isLoading) {
    return null;
  }

  if (error || !project) {
    return (
      <div className="bg-[#FBFAF1] min-h-screen py-10 px-4 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-txt-darkBrown mb-4">
            {isEn ? 'Project Not Found' : '找不到該專案'}
          </h1>
          <Link href="/projects" className="text-[#5E7985] font-bold underline">
            {isEn ? 'Back to Projects' : '回到作品集'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFAF1] min-h-screen pb-32 md:pb-10 pt-24 md:pt-32 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumbs */}
        <RevealOnScroll>
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 uppercase tracking-widest font-bold">
            <Link
              href="/projects"
              className="hover:text-txt-darkBrown transition-colors"
            >
              {isEn ? 'Projects' : '作品集'}
            </Link>
            <span>/</span>
            <span className="text-txt-darkBrown">{project.title}</span>
          </nav>
        </RevealOnScroll>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Gallery */}
          <div className="flex-1 min-w-0 lg:sticky lg:top-32 lg:h-fit">
            <RevealOnScroll delay={200}>
              <ProjectGallery media={project.media} />
            </RevealOnScroll>
          </div>

          {/* Right Column: Info */}
          <div className="flex-1 min-w-0 space-y-8">
            <RevealOnScroll delay={300}>
              <header className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500 tracking-widest">
                    {project.period}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors group"
                    >
                      {isLiked ? (
                        <span className="text-txt-red flex items-center justify-center">
                          <HeartFilled className="w-5 h-5" />
                        </span>
                      ) : (
                        <span className="group-hover:text-txt-red transition-colors flex items-center justify-center">
                          <Heart className="w-5 h-5" />
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center justify-center">
                        <Share className="w-5 h-5" />
                      </span>
                    </button>
                  </div>
                </div>
                <h1 className="text-4xl font-black text-txt-darkBrown">
                  {project.title}
                </h1>
              </header>
            </RevealOnScroll>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>

                <div className="prose prose-sm max-w-none text-txt-darkBrown leading-relaxed">
                  <h3 className="text-xl font-bold text-txt-darkBrown mb-2">
                    {isEn ? 'About the Project' : '關於此專案'}
                  </h3>
                  <p>{project.description}</p>
                </div>

                {/* Action Buttons — desktop inline */}
                {project.links && project.links.length > 0 ? (
                  <div className="hidden md:grid md:grid-cols-2 gap-4 pt-8">
                    {project.links.map((link, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            ${
                              isPrimary
                                ? 'bg-txt-darkBrown text-white hover:bg-opacity-90'
                                : 'border border-txt-darkBrown bg-transparent text-txt-darkBrown hover:bg-txt-darkBrown hover:text-white'
                            }
                            py-3 px-6 rounded-sm font-bold uppercase tracking-widest 
                            transition-all duration-300 flex flex-row items-center justify-center gap-2 text-center
                            hover:-translate-y-1 hover:shadow-md active:translate-y-0 group
                          `}
                        >
                          <span className="text-sm break-words">{link.label}</span>
                          <span className="flex items-center justify-center shrink-0">
                            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="hidden md:flex pt-8">
                    <button className="bg-gray-200 text-gray-500 py-3 rounded-full font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2 w-full">
                      {isEn ? 'No Link Available' : '暫無連結'}
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Detailed Sections (Tabbed) */}
        {project.sections && project.sections.length > 0 && (
            <div className="mt-16 md:mt-20">
              <ProjectDetailTabs sections={project.sections} />
            </div>
        )}
      </div>

      {/* Featured Projects */}
      {otherProjects.length > 0 && (
          <div className="mt-16 md:mt-24">
            <ProjectSlider
              title={isEn ? 'Featured Projects' : '精選作品'}
              projects={otherProjects}
            />
          </div>
      )}

      {/* Action Buttons — mobile fixed bottom bar */}
      {project.links && project.links.length > 0 ? (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBFAF1]/90 backdrop-blur-md border-t border-gray-200 px-4 pt-3 pb-safe"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col gap-2 max-w-lg mx-auto">
            {project.links.map((link, idx) => {
              const isPrimary = idx === 0;
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    ${
                      isPrimary
                        ? 'bg-txt-darkBrown text-white'
                        : 'border border-txt-darkBrown bg-transparent text-txt-darkBrown'
                    }
                    py-3 px-6 rounded-sm font-bold uppercase tracking-widest
                    transition-all duration-200 active:scale-95
                    flex flex-row items-center justify-center gap-2 text-center
                  `}
                >
                  <span className="text-sm">{link.label}</span>
                  <span className="flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={currentUrl}
      />
    </div>
  );
}
