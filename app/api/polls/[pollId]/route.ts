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

    const mappedPoll = {
      id: poll.id,
      title: poll.title,
      creatorId: poll.creatorId,
      createdAt: poll.createdAt,
      expiresAt: poll.expiresAt,
      closed: poll.closed,
      isPrivate: poll.isPrivate,
      hasPin: Boolean(poll.pinCode && poll.pinCode.trim().length > 0),
      options: poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        imageUrl: opt.imageUrl,
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
