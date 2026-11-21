import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Project } from '../api/project-list-api.type';
import { useLanguageStore } from '../store/language.store';

export const projectsAPIPath = '/api/projects';

export const projectsQueryKey = (language: string) => ['projects', language] as const;

export async function fetchProjects(language: string) {
  const { data } = await axios<Project[]>({
    method: 'GET',
    url: `${projectsAPIPath}?lang=${language}`,
  });
  return data;
}

export function useProjects() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: projectsQueryKey(language),
    queryFn: () => fetchProjects(language),
  });
}
