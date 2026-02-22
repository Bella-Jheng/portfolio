'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectGallery } from '../../../components/Common/Gallery';
import { Tag } from '../../../components/Atom/Tag';
import { Heart, HeartFilled, Share, ExternalLink } from '@/public/icon';
import { ShareModal } from '../../../components/Common/ShareModal';
import { RevealOnScroll } from '../../../components/Common/RevealOnScroll';
import { useProjectDetail } from '../../../api/project-detail-api';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { data: project, isLoading, error } = useProjectDetail(slug);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  if (isLoading) {
    return null;
  }

  if (error || !project) {
    return (
      <div className="bg-[#FBFAF1] min-h-screen py-10 px-4 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-txt-darkBrown mb-4">
            Project Not Found
          </h1>
          <Link href="/projects" className="text-[#5E7985] font-bold underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFAF1] min-h-screen pb-10 pt-24 md:pt-32 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumbs */}
        <RevealOnScroll>
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 uppercase tracking-widest font-bold">
            <Link
              href="/projects"
              className="hover:text-txt-darkBrown transition-colors"
            >
              Projects
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

            <RevealOnScroll delay={400}>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>

                <div className="prose prose-sm max-w-none text-txt-darkBrown leading-relaxed">
                  <h3 className="text-xl font-bold text-txt-darkBrown mb-2">
                    About the Project
                  </h3>
                  <p>{project.description}</p>
                </div>

                {/* Additional Sections */}
                {project.sections &&
                  project.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="prose prose-sm max-w-none text-txt-darkBrown leading-relaxed"
                    >
                      <h3 className="text-xl font-bold text-txt-darkBrown mb-2">
                        {section.title}
                      </h3>
                      <p className="whitespace-pre-line">{section.content}</p>
                    </div>
                  ))}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-8">
                  {project.links && project.links.length > 0 ? (
                    project.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] bg-txt-darkBrown text-white py-4 px-4 rounded-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex flex-row items-center justify-center gap-2 text-center"
                      >
                        <span className="break-words">{link.label}</span>
                        <span className="flex items-center justify-center shrink-0">
                          <ExternalLink className="w-5 h-5" />
                        </span>
                      </a>
                    ))
                  ) : (
                    <button className="flex-1 bg-gray-200 text-gray-500 py-4 rounded-sm font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                      No Link Available
                    </button>
                  )}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={currentUrl}
      />
    </div>
  );
}
