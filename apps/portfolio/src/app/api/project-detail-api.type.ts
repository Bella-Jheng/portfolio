import { Project } from './project-list-api.type';

export interface ProjectLink {
  url: string;
  type: 'website' | 'github' | 'document' | 'presentation' | 'external';
  label: string;
}

export interface ProjectSection {
  title: string;
  tabLabel?: string;
  whatIDid: string | string[];
  techUsed: string[];
  challenges: string | string[];
  comparisonTable?: {
    columns: string[];
    rows: string[][];
  };
  learnings: string | string[];
}

export interface FullProject extends Project {
  technologies: string[];
  media: { type: 'image' | 'video'; url: string; thumbnailUrl?: string }[];
  links?: ProjectLink[];
  sections: ProjectSection[];
  period: string;
}
