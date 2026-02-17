import { Project } from './project-list-api.type';

export interface ProjectLink {
  label: string;
  url: string;
  type: 'website' | 'github' | 'document' | 'presentation' | 'external';
}

export interface ProjectSection {
  title: string;
  content: string;
}

export interface FullProject extends Project {
  period: string;
  technologies: string[];
  media: { type: 'image' | 'video'; url: string; thumbnailUrl?: string }[];
  links?: ProjectLink[];
  sections?: ProjectSection[];
}
