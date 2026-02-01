'use client';
import React from 'react';
import Link from 'next/link';
import { Tag } from '../Atom/Tag';
import { ArrowRight } from '@/public/icon';

import { Project } from '../../api';

type ProjectCardProps = Project;

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  imageUrl,
  link,
  tags = [],
}) => {
  return (
    <Link
      href={link}
      className="group block bg-[#FBFBF2] border border-[#DEDDB8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2  transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Decorative arrow */}
        <div className="mt-4 flex items-center text-txt-red font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
          View Project
          <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};
