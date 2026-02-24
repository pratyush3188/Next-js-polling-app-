import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { v4 as uuidv4 } from 'uuid';
import { users, getUserByPasskeyId, getChallenge, deleteChallenge } from '@/lib/data';
import { setSession } from '@/lib/session';

const rpName = 'Polling App';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:3000`;

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

    // Get stored challenge
    const expectedChallenge = getChallenge(challengeKey);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    // Verify the registration
    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    // Delete used challenge
    deleteChallenge(challengeKey);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    // Extract credential info (id is base64url, publicKey is Uint8Array)
    const credential = verification.registrationInfo.credential;
    // Convert base64url id to base64 for storage
    const credentialID = Buffer.from(credential.id, 'base64url').toString('base64');
    // Convert Uint8Array publicKey to base64 for storage
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');

    // Check if user already exists
    const existingUser = getUserByPasskeyId(credentialID);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      username,
      passkeyId: credentialID,
      passkeyPublicKey: publicKeyBase64,
      createdAt: new Date(),
    };

    users.push(newUser);
    await setSession(userId);

    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, username: newUser.username } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

