import { NextRequest, NextResponse } from 'next/server';
import { suggestKnowledgeTags } from '../../../lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json() as { title: string; content: string };
    if (!content?.trim()) return NextResponse.json({ tags: [] });

    const tags = await suggestKnowledgeTags(title ?? '', content);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Suggest tags error:', error);
    return NextResponse.json({ tags: [] });
  }
}
