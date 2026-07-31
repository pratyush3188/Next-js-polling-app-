'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      });
  }, [router, setUser]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--navy-deep)' }}>
            Account & Security Settings
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your profile details and biometric Passkey authentication security.
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="p-6 sm:p-8 rounded-2xl border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--navy-deep)' }}>
            User Profile
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--navy-deep)' }}>{user.username}</div>
              <div className="text-xs text-slate-400">Account ID: {user.id}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 text-slate-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security / Passkey Section */}
        <div
          className="p-6 sm:p-8 rounded-2xl border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--navy-deep)' }}>
            Biometric Passkey Security
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Your account is secured with WebAuthn Passkeys. Passwordless login is active.
          </p>

          <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 4.12c-.1.6-.241 1.189-.42 1.76M12 7a4 4 0 00-4 4c0 .48.064.946.183 1.388m9.634 3.612a13.96 13.96 0 00.983-4a8 8 0 10-14.8 4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-xs text-emerald-900">Passkey Active</div>
              <div className="text-[11px] text-emerald-700">Registered biometric device linked to your session.</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="p-6 sm:p-8 rounded-2xl border border-red-200 bg-red-50/30"
        >
          <h2 className="text-lg font-bold text-red-900 mb-2">Session Management</h2>
          <p className="text-xs text-red-600 mb-4">Log out of your active session on this browser.</p>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            Log Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
