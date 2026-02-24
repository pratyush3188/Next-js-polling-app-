import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { users, getUserByPasskeyId, getChallenge, deleteChallenge } from '@/lib/data';
import { setSession } from '@/lib/session';

const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:3000`;

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

    // Get stored challenge
    const expectedChallenge = getChallenge(challengeKey);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    // authenticationResponse.id comes as base64url from browser
    // Find user by passkey ID (helper function handles base64/base64url conversion)
    const credentialID = authenticationResponse.id;
    const user = getUserByPasskeyId(credentialID);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the authentication
    // Convert stored base64 to base64url for id, and to Uint8Array for publicKey
    const credentialId = Buffer.from(user.passkeyId, 'base64').toString('base64url');
    const publicKey = new Uint8Array(Buffer.from(user.passkeyPublicKey, 'base64'));
    
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credentialId,
        publicKey: publicKey,
        counter: 0,
      },
    });

    // Delete used challenge
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

