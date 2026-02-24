import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { polls } from '@/lib/data';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { title, options } = body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options required' },
        { status: 400 }
      );
    }

    // Check for duplicate options
    const uniqueOptions = new Set(options.map((opt: string) => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== options.length) {
      return NextResponse.json(
        { error: 'Duplicate options not allowed' },
        { status: 400 }
      );
    }

    // Create poll
    const poll = {
      id: uuidv4(),
      title: title.trim(),
      options: options.map((text: string) => ({
        id: uuidv4(),
        text: text.trim(),
        votes: 0,
      })),
      creatorId: userId,
      createdAt: new Date(),
      closed: false,
    };

    polls.push(poll);

    return NextResponse.json({ success: true, poll });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Create poll error:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({ polls });
  } catch (error) {
    console.error('Get polls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}

