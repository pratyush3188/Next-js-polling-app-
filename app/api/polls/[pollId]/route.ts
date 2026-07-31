import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } }
          }
        },
        _count: { select: { votes: true } }
      }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Map Prisma objects to match the expected UI structure
    const mappedPoll = {
      ...poll,
      options: poll.options.map(opt => ({
        ...opt,
        votes: opt._count.votes
      }))
    };

    return NextResponse.json({ poll: mappedPoll });
  } catch (error) {
    console.error('Get poll error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}
