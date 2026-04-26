import { FullProject } from '../project-detail-api.type';
import { PROJECTS_DATA_ZH } from '../data/projects-data-zh';
import { PROJECTS_DATA_EN } from '../data/projects-data-en';

export function getProjectDetailApiResponse(
  slug: string,
  lang: 'zh' | 'en' = 'zh',
): FullProject | null {
  const data = lang === 'en' ? PROJECTS_DATA_EN : PROJECTS_DATA_ZH;
  const project = data.find((p) => p.link.includes(slug));
  
  if (!project) return null;

  return project;
}
