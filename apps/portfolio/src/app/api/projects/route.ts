import { NextRequest, NextResponse } from 'next/server';
import { getProjectListApiResponse } from '../mocks/project-list-api-mock';

export function GET(request: NextRequest) {
  const lang = (request.nextUrl.searchParams.get('lang') as 'zh' | 'en') || 'zh';
  return NextResponse.json(getProjectListApiResponse(lang));
}
