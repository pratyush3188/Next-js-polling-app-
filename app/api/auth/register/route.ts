import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getChallenge, deleteChallenge } from '@/lib/data';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, registrationResponse, challengeKey } = body;

    if (!username || !registrationResponse || !challengeKey) {
      return NextResponse.json(
        { error: 'Username, registration response, and challenge key required' },
        { status: 400 }
      );
    }

    const expectedChallenge = getChallenge(challengeKey);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge. Please try again.' },
        { status: 400 }
      );
    }

    const reqOrigin = request.headers.get('origin') || 'http://localhost:3000';
    const reqHost = request.headers.get('host')?.split(':')[0] || 'localhost';

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: expectedChallenge,
      expectedOrigin: reqOrigin,
      expectedRPID: reqHost,
    });

    deleteChallenge(challengeKey);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    const credential = verification.registrationInfo.credential;
    const credentialID = Buffer.from(credential.id, 'base64url').toString('base64');
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { passkeyId: credentialID }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or passkey is already registered.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        passkeyId: credentialID,
        passkeyPublicKey: publicKeyBase64,
      }
    });

    await setSession(newUser.id);

    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, username: newUser.username } 
    });
  } catch (error: any) {
    console.error('Registration error details:', error);
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
