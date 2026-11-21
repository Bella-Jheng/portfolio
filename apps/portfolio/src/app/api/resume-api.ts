import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ResumeData } from './resume-api.type';
import { useLanguageStore } from '../store/language.store';

export const resumeAPIPath = '/api/resume';

export const resumeQueryKey = (language: string) => ['resume', language] as const;

export async function fetchResume(language: string) {
  const { data } = await axios<ResumeData>({
    method: 'GET',
    url: `${resumeAPIPath}?lang=${language}`,
  });
  return data;
}

export function useResume() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: resumeQueryKey(language),
    queryFn: () => fetchResume(language),
  });
}
