import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { pinCode: true }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (!poll.pinCode || poll.pinCode.trim() === '') {
      return NextResponse.json({ success: true, message: 'No PIN required' });
    }

    if (poll.pinCode.trim() === String(pin).trim()) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Incorrect 4-Digit PIN code' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PIN verification error:', error);
    return NextResponse.json({ error: 'Failed to verify PIN' }, { status: 500 });
  }
}
