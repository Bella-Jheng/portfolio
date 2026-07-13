import { NextRequest, NextResponse } from 'next/server';
import { getResumeDataMock } from '../mocks/resume-api-mock';

export function GET(request: NextRequest) {
  const lang = (request.nextUrl.searchParams.get('lang') as 'zh' | 'en') || 'zh';
  return NextResponse.json(getResumeDataMock(lang));
}
