import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const userId = await requireAuth();
    
    const vote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId
        }
      }
    });
    
    return NextResponse.json({ hasVoted: !!vote });
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
