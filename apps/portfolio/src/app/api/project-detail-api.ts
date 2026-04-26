import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FullProject } from './project-detail-api.type';
import { useLanguageStore } from '../store/language.store';

export const projectDetailAPIPath = '/api/project-detail';

export function useProjectDetail(slug: string) {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: ['project-detail', slug, language],
    queryFn: async () => {
      const { data } = await axios<FullProject>({
        method: 'GET',
        url: `${projectDetailAPIPath}/${slug}?lang=${language}`,
      });
      return data;
    },
    enabled: !!slug,
  });
}
