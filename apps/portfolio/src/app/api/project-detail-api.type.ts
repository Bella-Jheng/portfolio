import { Project } from './project-list-api.type';

export interface ProjectLink {
  url: string;
  type: 'website' | 'github' | 'document' | 'presentation' | 'external';
  label: string;
}

export interface TextSection {
  type?: 'text';
  title: string;
  content: string;
  tabLabel?: string;
}

export interface DecisionOption {
  label: string;
  detail: string;
}

export interface DecisionSection {
  type: 'decision';
  title: string;
  problem: string;
  options?: DecisionOption[];
  decision: string;
  why?: string[];
  tabLabel?: string;
}

export interface ComparisonSection {
  type: 'comparison';
  title: string;
  content?: string;
  columns: string[];
  rows: string[][];
  tabLabel?: string;
}

export type ProjectSection = TextSection | DecisionSection | ComparisonSection;

export interface FullProject extends Project {
  technologies: string[];
  media: { type: 'image' | 'video'; url: string; thumbnailUrl?: string }[];
  links?: ProjectLink[];
  sections: ProjectSection[];
  period: string;
}
