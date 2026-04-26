import { ResumeData } from '../resume-api.type';
import { RESUME_DATA_ZH } from '../data/resume-data-zh';
import { RESUME_DATA_EN } from '../data/resume-data-en';

export const getResumeDataMock = (lang: 'zh' | 'en' = 'zh'): ResumeData => {
  return lang === 'en' ? RESUME_DATA_EN : RESUME_DATA_ZH;
};
