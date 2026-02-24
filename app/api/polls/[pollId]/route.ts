import { NextRequest, NextResponse } from 'next/server';
import { getPollById } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const poll = getPollById(pollId);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ poll });
  } catch (error) {
    console.error('Get poll error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

