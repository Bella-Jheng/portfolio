import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ResumeData } from './resume-api.type';
import { useLanguageStore } from '../store/language.store';

export const resumeAPIPath = '/api/resume';

export function useResume() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: ['resume', language],
    queryFn: async () => {
      const { data } = await axios<ResumeData>({
        method: 'GET',
        url: `${resumeAPIPath}?lang=${language}`,
      });
      return data;
    },
  });
}
