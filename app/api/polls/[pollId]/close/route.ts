import { NextRequest, NextResponse } from 'next/server';
import { getPollById, getPollResults } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { broadcastPollUpdate } from '@/lib/broadcast';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const userId = await requireAuth();
    const poll = getPollById(pollId);

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Only poll creator can close poll' },
        { status: 403 }
      );
    }

    poll.closed = true;

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
    console.error('Close poll error:', error);
    return NextResponse.json(
      { error: 'Failed to close poll' },
      { status: 500 }
    );
  }
}

