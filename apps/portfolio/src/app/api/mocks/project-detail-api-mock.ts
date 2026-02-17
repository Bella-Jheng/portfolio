import { FullProject } from '../project-detail-api.type';
import { PROJECTS_DATA } from '../data/projects-data';

export function getProjectDetailApiResponse(id: string): FullProject | null {
  return PROJECTS_DATA.find((project) => project.id === id) || null;
}
