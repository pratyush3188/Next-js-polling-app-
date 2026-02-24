import { NextRequest, NextResponse } from 'next/server';
import { hasUserVoted } from '@/lib/data';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const userId = await requireAuth();
    const voted = hasUserVoted(pollId, userId);
    return NextResponse.json({ hasVoted: voted });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ hasVoted: false });
    }
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}

