import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getPollResults } from '@/lib/polls';
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

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.closed || (poll.expiresAt && new Date() > new Date(poll.expiresAt))) {
      return NextResponse.json(
        { error: 'This poll has expired and is closed' },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId
        }
      }
    });

    if (existingVote) {
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
    await prisma.vote.create({
      data: {
        pollId,
        optionId,
        userId
      }
    });

    // Broadcast update to SSE connections
    await broadcastPollUpdate(pollId, () => getPollResults(pollId));

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
