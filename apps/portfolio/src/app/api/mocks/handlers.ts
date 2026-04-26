import { http, HttpResponse } from 'msw';
import { getProjectListApiResponse } from './project-list-api-mock';
import { getProjectDetailApiResponse } from './project-detail-api-mock';
import { getResumeDataMock } from './resume-api-mock';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    });
  }),
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const lang = (url.searchParams.get('lang') as 'zh' | 'en') || 'zh';
    return HttpResponse.json(getProjectListApiResponse(lang));
  }),
  http.get('/api/project-detail/:slug', ({ params, request }) => {
    const { slug } = params;
    const url = new URL(request.url);
    const lang = (url.searchParams.get('lang') as 'zh' | 'en') || 'zh';
    const project = getProjectDetailApiResponse(slug as string, lang);
    if (!project) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(project);
  }),
  http.get('/api/resume', ({ request }) => {
    const url = new URL(request.url);
    const lang = (url.searchParams.get('lang') as 'zh' | 'en') || 'zh';
    return HttpResponse.json(getResumeDataMock(lang));
  }),
];
