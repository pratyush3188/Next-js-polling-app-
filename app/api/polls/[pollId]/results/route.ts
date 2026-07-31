import { NextRequest, NextResponse } from 'next/server';
import { getPollResults } from '@/lib/polls';
import { prisma } from '@/lib/db';
import { addConnection, removeConnection } from '@/lib/broadcast';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    
    // Quick check if poll exists
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const live = searchParams.get('live') === 'true';

    if (live) {
      // SSE stream for real-time updates
      const stream = new ReadableStream({
        async start(controller) {
          // Add controller to connections
          addConnection(pollId, controller);

          // Send initial data
          const results = await getPollResults(pollId);
          if (results) {
            const data = JSON.stringify(results);
            controller.enqueue(`data: ${data}\n\n`);
          }

          // Clean up on close
          request.signal.addEventListener('abort', () => {
            removeConnection(pollId, controller);
          });
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Regular JSON response
      const results = await getPollResults(pollId);
      if (!results) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
