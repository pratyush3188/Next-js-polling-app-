import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { storeChallenge } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

const rpName = 'Polling App';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:3000`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
    });

    // Store challenge for verification
    const challengeKey = `reg_${username}_${uuidv4()}`;
    storeChallenge(challengeKey, options.challenge);

    return NextResponse.json({ ...options, challengeKey });
  } catch (error) {
    console.error('Registration options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}

