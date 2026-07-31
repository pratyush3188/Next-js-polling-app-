import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { title, options, expiresAt } = body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options required' },
        { status: 400 }
      );
    }

    const parsedOptions = options.map((opt: any) => {
      if (typeof opt === 'string') {
        return { text: opt.trim(), imageUrl: null };
      }
      return {
        text: (opt.text || '').trim(),
        imageUrl: opt.imageUrl ? opt.imageUrl.trim() : null
      };
    });

    const uniqueOptions = new Set(parsedOptions.map(o => o.text.toLowerCase()));
    if (uniqueOptions.size !== parsedOptions.length) {
      return NextResponse.json(
        { error: 'Duplicate option titles not allowed' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        title: title.trim(),
        creatorId: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        options: {
          create: parsedOptions
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json({ success: true, poll });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Create poll error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create poll' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } }
          }
        },
        _count: { select: { votes: true } }
      }
    });

    const mappedPolls = polls.map(p => ({
      ...p,
      options: p.options.map(opt => ({
        ...opt,
        votes: opt._count.votes
      }))
    }));

    return NextResponse.json({ polls: mappedPolls });
  } catch (error) {
    console.error('Get polls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}
