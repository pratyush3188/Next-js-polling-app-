import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Find all votes cast by this user, including poll and options
    const userVotes = await prisma.vote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } }
              }
            },
            _count: { select: { votes: true } }
          }
        },
        option: true
      }
    });

    // Map to rich data format for UI
    const votedPolls = userVotes.map(vote => {
      const poll = vote.poll;
      const totalVotes = poll._count.votes;

      const results = poll.options.map(opt => {
        const optionVotes = opt._count.votes;
        const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
        return {
          optionId: opt.id,
          text: opt.text,
          votes: optionVotes,
          percentage: Math.round(percentage * 100) / 100
        };
      });

      return {
        pollId: poll.id,
        title: poll.title,
        closed: poll.closed,
        votedAt: vote.createdAt,
        myVoteOptionId: vote.optionId,
        myVoteOptionText: vote.option.text,
        results: {
          totalVotes,
          results
        }
      };
    });

    return NextResponse.json({ success: true, polls: votedPolls });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get my-votes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your votes' },
      { status: 500 }
    );
  }
}
