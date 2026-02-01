'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectGallery } from '../../../components/Common/Gallery';
import { Tag } from '../../../components/Atom/Tag';
import { Heart, HeartFilled, Share, ExternalLink } from '@/public/icon';
import { ShareModal } from '../../../components/Common/ShareModal';
import { RevealOnScroll } from '../../../components/Common/RevealOnScroll';

interface ProjectDetail {
  title: string;
  period: string;
  description: string;
  technologies: string[];
  media: { type: 'image' | 'video'; url: string; thumbnailUrl?: string }[];
}

const PROJECTS_DETAILS_DATA: Record<string, ProjectDetail> = {
  alpha: {
    title: 'Project Alpha',
    period: '2024-PRESENT',
    description:
      'A comprehensive e-commerce platform built with Next.js and Tailwind CSS, focusing on user experience and performance.',
    technologies: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Redux'],
    media: [
      {
        type: 'image',
        url: 'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h9e/h1a/10099943014430/PALETTE-.jpg',
      },
      {
        type: 'image',
        url: 'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h56/hac/10099943145502/PALETTE-.jpg',
      },
    ],
  },
  beta: {
    title: 'Beta Dashboard',
    period: '2023-2024',
    description:
      'An interactive analytics dashboard providing real-time data visualization and insightful metrics for business growth.',
    technologies: ['React', 'Chart.js', 'D3.js', 'SASS'],
    media: [
      {
        type: 'image',
        url: 'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h56/hac/10099943145502/PALETTE-.jpg',
      },
      {
        type: 'image',
        url: 'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h9e/h1a/10099943014430/PALETTE-.jpg',
      },
    ],
  },
  gamma: {
    title: 'Gamma Mobile App',
    period: '2022-2023',
    description:
      'A sleek and responsive mobile application designed to streamline daily tasks and improve productivity for professionals.',
    technologies: ['React Native', 'Firebase', 'TypeScript'],
    media: [
      {
        type: 'image',
        url: 'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h62/hf6/10099943276574/-.jpg',
      },
    ],
  },
  delta: {
    title: 'Delta Portfolio',
    period: '2022',
    description:
      'A premium portfolio template featuring smooth animations and a minimalist design to showcase creative work effectively.',
    technologies: ['Framer Motion', 'React', 'Tailwind CSS'],
    media: [
      {
        type: 'image',
        url: 'https://pcm.trplus.com.tw/1000x1000/sys-master/productImages/h96/hd5/12454123831326/000000000014379154-gallery-01-20250415150807143.jpg',
      },
    ],
  },
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const project = PROJECTS_DETAILS_DATA[slug];

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!project) {
    return (
      <div className="bg-[#FBFAF1] min-h-screen py-10 px-4 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#2D1B1B] mb-4">
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
              className="hover:text-[#2D1B1B] transition-colors"
            >
              Projects
            </Link>
            <span>/</span>
            <span className="text-[#2D1B1B]">{project.title}</span>
          </nav>
        </RevealOnScroll>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Gallery */}
          <div className="flex-1 min-w-0">
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
                        <HeartFilled className="w-5 h-5 text-txt-red" />
                      ) : (
                        <Heart className="w-5 h-5 group-hover:text-txt-red transition-colors" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h1 className="text-4xl font-black text-[#2D1B1B]">
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

                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <h3 className="text-xl font-bold text-[#2D1B1B] mb-2">
                    About the Project
                  </h3>
                  <p>{project.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8">
                  <button className="flex-1 bg-[#2D1B1B] text-white py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                    Visit Website
                    <ExternalLink className="w-5 h-5" />
                  </button>
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
