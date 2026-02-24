import { NextRequest, NextResponse } from 'next/server';
import { getPollById, hasUserVoted, votes, getPollResults } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { broadcastPollUpdate } from '@/lib/broadcast';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const userId = await requireAuth();
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: 'optionId required' },
        { status: 400 }
      );
    }

    const poll = getPollById(pollId);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.closed) {
      return NextResponse.json(
        { error: 'Poll is closed' },
        { status: 400 }
      );
    }

    if (hasUserVoted(pollId, userId)) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 400 }
      );
    }

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) {
      return NextResponse.json(
        { error: 'Invalid option' },
        { status: 400 }
      );
    }

    // Add vote
    votes.push({
      pollId,
      optionId,
      userId,
      createdAt: new Date(),
    });

    // Broadcast update to SSE connections
    broadcastPollUpdate(pollId, () => getPollResults(pollId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}

