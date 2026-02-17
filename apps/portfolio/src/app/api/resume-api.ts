import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ResumeData } from './resume-api.type';

export const resumeAPIPath = '/api/resume';

export function useResume() {
  return useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data } = await axios<ResumeData>({
        method: 'GET',
        url: resumeAPIPath,
      });
      return data;
    },
  });
}
