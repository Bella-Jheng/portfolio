import { Project } from '../project-list-api.type';
import { PROJECTS_DATA_ZH } from '../data/projects-data-zh';
import { PROJECTS_DATA_EN } from '../data/projects-data-en';

export function getProjectListApiResponse(lang: 'zh' | 'en' = 'zh'): Project[] {
  const data = lang === 'en' ? PROJECTS_DATA_EN : PROJECTS_DATA_ZH;
  return data.map((project) => ({
    id: project.id,
    imageUrl: project.imageUrl,
    link: project.link,
    tags: project.tags,
    category: project.category,
    title: project.title,
    description: project.description,
    displayCategory: project.displayCategory,
  }));
}
