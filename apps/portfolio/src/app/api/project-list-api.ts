import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Project } from '../api/project-list-api.type';

export const projectsAPIPath = '/api/projects';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios<Project[]>({
        method: 'GET',
        url: projectsAPIPath,
      });
      return data;
    },
  });
}
