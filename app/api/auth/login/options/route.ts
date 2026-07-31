import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { storeChallenge } from '@/lib/data';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get('host')?.split(':')[0] || 'localhost';

    const allUsers = await prisma.user.findMany({ select: { passkeyId: true } });
    
    const allowCredentials = allUsers.map(user => ({
      id: Buffer.from(user.passkeyId, 'base64').toString('base64url'),
    }));

    const options = await generateAuthenticationOptions({
      rpID: host,
      timeout: 60000,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: 'preferred',
    });

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
