import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Project } from '../api/project-list-api.type';
import { useLanguageStore } from '../store/language.store';

export const projectsAPIPath = '/api/projects';

export function useProjects() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: ['projects', language],
    queryFn: async () => {
      const { data } = await axios<Project[]>({
        method: 'GET',
        url: `${projectsAPIPath}?lang=${language}`,
      });
      return data;
    },
  });
}
