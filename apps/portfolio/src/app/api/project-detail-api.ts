import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FullProject } from './project-detail-api.type';

export const projectDetailAPIPath = (id: string) => `/api/projects/${id}`;

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await axios<FullProject>({
        method: 'GET',
        url: projectDetailAPIPath(id),
      });
      return data;
    },
    enabled: !!id,
  });
}
