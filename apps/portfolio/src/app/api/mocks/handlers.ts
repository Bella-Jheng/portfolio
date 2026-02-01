import { http, HttpResponse } from 'msw';
import { getProjectListApiResponse } from './project-list-api-mock';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    });
  }),
  http.get('/api/projects', () => {
    return HttpResponse.json(getProjectListApiResponse());
  }),
];
