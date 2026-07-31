import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { storeChallenge } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

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

    const host = request.headers.get('host')?.split(':')[0] || 'localhost';

    const options = await generateRegistrationOptions({
      rpName: 'Polling App',
      rpID: host,
      userName: username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        userVerification: 'preferred',
      },
    });

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
