import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=GitHub+Authorization+Failed', request.url));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/login?error=GitHub+Keys+Missing+in+.env', request.url));
    }

    // Exchange code for access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      const errDetail = tokenData.error_description || tokenData.error || 'Failed to get GitHub token';
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errDetail)}`, request.url));
    }

    // Fetch user profile from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'VoteFlow-App',
      },
    });

    const githubUser = await userRes.json();

    if (!githubUser.id) {
      return NextResponse.redirect(new URL('/login?error=Invalid+GitHub+User+Profile', request.url));
    }

    const githubId = String(githubUser.id);
    let username = (githubUser.login || `github_${githubId}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Find or create user in SQLite database safely
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId },
            { username }
          ]
        }
      });
    } catch (dbErr) {
      user = await prisma.user.findUnique({
        where: { username }
      });
    }

    if (!user) {
      const existingName = await prisma.user.findUnique({ where: { username } });
      if (existingName) {
        username = `${username}_gh`;
      }

      try {
        user = await prisma.user.create({
          data: {
            username,
            githubId,
          },
        });
      } catch (createErr) {
        user = await prisma.user.create({
          data: {
            username,
          },
        });
      }
    } else if (!user.githubId) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId },
        });
      } catch (updErr) {
        // Safe fallback
      }
    }

    // Set 7-day session cookie
    await setSession(user.id);

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error: any) {
    console.error('GitHub Callback Error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || 'Authentication Error')}`, request.url));
  }
}
