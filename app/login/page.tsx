'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { useStore } from '@/lib/store';

export default function Login() {
  const router = useRouter();
  const { setUser } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Get authentication options
      const optionsRes = await fetch('/api/auth/login/options', {
        method: 'POST',
      });
      const options = await optionsRes.json();

      if (options.error) {
        setError(options.error);
        setLoading(false);
        return;
      }

      // Extract challengeKey before starting authentication
      const { challengeKey, ...authOptions } = options;

      // Start authentication
      const authResponse = await startAuthentication(authOptions);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login with Passkey'}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

