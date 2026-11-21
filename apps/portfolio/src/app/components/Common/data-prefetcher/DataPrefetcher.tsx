'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProjects, projectsQueryKey } from '../../../api';
import {
  fetchProjectDetail,
  projectDetailQueryKey,
} from '../../../api/project-detail-api';
import { fetchResume, resumeQueryKey } from '../../../api/resume-api';
import { useLanguageStore } from '../../../store/language.store';

const idle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 300);
  return () => window.clearTimeout(id);
};

/**
 * 任何頁面載入後，趁瀏覽器空閒時先把所有專案詳細頁與履歷的資料抓下來
 * （每個專案約 10KB）。之後點進任何頁面都直接用快取，不用再等 API。
 */
export const DataPrefetcher: React.FC = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageStore();
  useEffect(() => {
    // 等頁面本身的資料先載完、瀏覽器空閒了才開始，不跟目前頁面搶頻寬
    return idle(async () => {
      // 不用 useProjects()：預抓不應該被當成「頁面在等資料」而觸發全螢幕 loading
      const projects = await queryClient
        .fetchQuery({
          queryKey: projectsQueryKey(language),
          queryFn: () => fetchProjects(language),
        })
        .catch(() => []);

      queryClient.prefetchQuery({
        queryKey: resumeQueryKey(language),
        queryFn: () => fetchResume(language),
      });
      projects.forEach((p) => {
        const slug = p.link.split('/').filter(Boolean).pop();
        if (!slug) return;
        queryClient.prefetchQuery({
          queryKey: projectDetailQueryKey(slug, language),
          queryFn: () => fetchProjectDetail(slug, language),
        });
      });
    });
  }, [language, queryClient]);

  return null;
};
