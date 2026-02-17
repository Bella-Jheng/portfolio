import { Project } from '../project-list-api.type';
import { PROJECTS_DATA } from '../data/projects-data';

export function getProjectListApiResponse(): Project[] {
  return PROJECTS_DATA.map(
    ({ id, title, category, description, imageUrl, link, tags }) => ({
      id,
      title,
      category,
      description,
      imageUrl,
      link,
      tags,
    }),
  );
}
