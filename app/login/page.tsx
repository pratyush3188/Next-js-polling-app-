'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Login() {
  const router = useRouter();
  const { setUser } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const container = useRef<HTMLDivElement>(null);

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

      // Get authentication options
      const optionsRes = await fetch('/api/auth/login/options', { method: 'POST' });
      const options = await optionsRes.json();

      if (options.error) {
        setError(options.error);
        setLoading(false);
        return;
      }

      // Extract challengeKey before starting authentication
      const { challengeKey, ...authOptions } = options;

      // Start authentication
      const authResponse = await startAuthentication({ optionsJSON: authOptions });

      // Verify authentication
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
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[150px] pointer-events-none" />

      <div className="auth-box w-full max-w-[420px] relative z-10">
        
        {/* The Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
          
          <div className="text-center mb-10 auth-element">
            <h1 className="font-serif text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Welcome.
            </h1>
            <p className="text-slate-500 text-sm font-light">
              Access your account seamlessly with biometric passkeys. No passwords required.
            </p>
          </div>

          {/* Error notification */}
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
            {/* Passkey Login CTA */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 px-6 text-white font-semibold rounded-2xl text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer bg-blue-600"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 4.12c-.1.6-.241 1.189-.42 1.76M12 7a4 4 0 00-4 4c0 .48.064.946.183 1.388m9.634 3.612a13.96 13.96 0 00.983-4a8 8 0 10-14.8 4" />
                  </svg>
                  <span>Sign in with Passkey</span>
                </>
              )}
            </button>

            <div className="relative text-center my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative px-4 text-xs font-medium text-slate-400 bg-white">
                Social Auth (Dummy)
              </span>
            </div>

            {/* Dummy Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 px-4 text-sm font-semibold rounded-2xl border border-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-50 hover:border-slate-200 text-slate-600"
                onClick={() => alert('Social Auth is currently a placeholder')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="py-3 px-4 text-sm font-semibold rounded-2xl border border-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-50 hover:border-slate-200 text-slate-600"
                onClick={() => alert('Social Auth is currently a placeholder')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
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
