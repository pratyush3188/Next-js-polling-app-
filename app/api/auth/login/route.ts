import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { getChallenge, deleteChallenge } from '@/lib/data';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authenticationResponse, challengeKey } = body;

    if (!authenticationResponse || !challengeKey) {
      return NextResponse.json(
        { error: 'Authentication response and challenge key required' },
        { status: 400 }
      );
    }

    const expectedChallenge = getChallenge(challengeKey);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    const credentialID = authenticationResponse.id;
    const base64Id = Buffer.from(credentialID, 'base64url').toString('base64');
    
    const user = await prisma.user.findUnique({
      where: { passkeyId: base64Id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const reqOrigin = request.headers.get('origin') || 'http://localhost:3000';
    const reqHost = request.headers.get('host')?.split(':')[0] || 'localhost';

    const credentialIdStr = Buffer.from(user.passkeyId, 'base64').toString('base64url');
    const publicKey = new Uint8Array(Buffer.from(user.passkeyPublicKey, 'base64'));
    
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: expectedChallenge,
      expectedOrigin: reqOrigin,
      expectedRPID: reqHost,
      credential: {
        id: credentialIdStr,
        publicKey: publicKey,
        counter: 0,
      },
    });

    deleteChallenge(challengeKey);

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      );
    }

    await setSession(user.id);

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
