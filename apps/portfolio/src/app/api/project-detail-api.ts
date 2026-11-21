import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FullProject } from './project-detail-api.type';
import { useLanguageStore } from '../store/language.store';

export const projectDetailAPIPath = '/api/project-detail';

export const projectDetailQueryKey = (slug: string, language: string) =>
  ['project-detail', slug, language] as const;

export async function fetchProjectDetail(slug: string, language: string) {
  const { data } = await axios<FullProject>({
    method: 'GET',
    url: `${projectDetailAPIPath}/${slug}?lang=${language}`,
  });
  return data;
}

export function useProjectDetail(slug: string) {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: projectDetailQueryKey(slug, language),
    queryFn: () => fetchProjectDetail(slug, language),
    enabled: !!slug,
  });
}
