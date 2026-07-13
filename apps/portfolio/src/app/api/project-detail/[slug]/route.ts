import { NextRequest, NextResponse } from 'next/server';
import { getProjectDetailApiResponse } from '../../mocks/project-detail-api-mock';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = (request.nextUrl.searchParams.get('lang') as 'zh' | 'en') || 'zh';
  const project = getProjectDetailApiResponse(slug, lang);

  if (!project) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(project);
}
