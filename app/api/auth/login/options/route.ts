import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { users, storeChallenge } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:3000`;

export async function POST() {
  try {
    // Get all registered passkey IDs (convert from base64 to base64url string)
    const allowCredentials = users.map(user => ({
      id: Buffer.from(user.passkeyId, 'base64').toString('base64url'),
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: 'preferred',
    });

    // Store challenge for verification
    const challengeKey = `auth_${uuidv4()}`;
    storeChallenge(challengeKey, options.challenge);

    return NextResponse.json({ ...options, challengeKey });
  } catch (error) {
    console.error('Login options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}

