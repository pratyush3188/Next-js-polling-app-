'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  useGSAP(() => {
    gsap.from('.auth-box', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
    gsap.from('.auth-element', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.3
    });
  }, { scope: container });

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const optionsRes = await fetch('/api/auth/login/options', { method: 'POST' });
      const options = await optionsRes.json();

      if (options.error) {
        setError(options.error);
        setLoading(false);
        return;
      }

      const { challengeKey, ...authOptions } = options;

      const authResponse = await startAuthentication({ optionsJSON: authOptions });

      const verifyRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authenticationResponse: authResponse,
          challengeKey: challengeKey 
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.error) {
        setError(verifyData.error);
        setLoading(false);
        return;
      }

      if (verifyData.success) {
        setUser(verifyData.user);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div
      ref={container}
      className="min-h-[calc(100vh-var(--navbar-height))] flex flex-col md:flex-row items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-white"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[150px] pointer-events-none" />

      <div className="auth-box w-full max-w-[420px] relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
          <div className="text-center mb-10 auth-element">
            <h1 className="font-serif text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Welcome.
            </h1>
            <p className="text-slate-500 text-sm font-light">
              Access your account seamlessly with GitHub or Passkeys.
            </p>
          </div>

          {error && (
            <div className="auth-element mb-6 p-4 rounded-2xl text-sm flex items-start gap-3 bg-red-50 text-red-600 border border-red-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6 auth-element">
            <button
              type="button"
              className="w-full py-4 px-6 text-white font-semibold rounded-2xl text-base transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer bg-slate-900 hover:bg-slate-800"
              onClick={() => window.location.href = '/api/auth/github'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="relative text-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-4 text-xs font-semibold text-slate-400 bg-white uppercase tracking-wider">
                Or Passkey
              </span>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 px-6 text-slate-700 font-semibold rounded-2xl text-sm transition-all duration-300 border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer bg-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 4.12c-.1.6-.241 1.189-.42 1.76M12 7a4 4 0 00-4 4c0 .48.064.946.183 1.388m9.634 3.612a13.96 13.96 0 00.983-4a8 8 0 10-14.8 4" />
                  </svg>
                  <span>Sign in with Passkey</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-8 text-slate-500 auth-element">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
