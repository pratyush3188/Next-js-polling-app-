'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  createdAt: string;
  expiresAt?: string | null;
  closed: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export default function ManagePolls() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      });

    // Fetch all polls
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.polls) {
          setPolls(data.polls);
        }
        setLoading(false);
      });
  }, [router, setUser]);

  const handleClose = async (pollId: string) => {
    if (!confirm('Are you sure you want to close this poll?')) return;

    const res = await fetch(`/api/polls/${pollId}/close`, {
      method: 'POST',
    });

    const data = await res.json();
    if (data.success) {
      setPolls(polls.map(p => p.id === pollId ? { ...p, closed: true } : p));
    } else {
      alert(data.error || 'Failed to close poll');
    }
  };

  const handleReset = async (pollId: string) => {
    if (!confirm('Are you sure you want to reset all votes for this poll?')) return;

    const res = await fetch(`/api/polls/${pollId}/reset`, {
      method: 'POST',
    });

    const data = await res.json();
    if (data.success) {
      alert('Votes reset successfully');
      window.location.reload();
    } else {
      alert(data.error || 'Failed to reset votes');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const myPolls = polls.filter(p => p.creatorId === user.id);

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--navy-deep)' }}>
              Manage My Polls
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              View, close, or reset votes for the polls you have created.
            </p>
          </div>
          <Link
            href="/polls/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 self-start sm:self-auto"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Poll
          </Link>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-shimmer"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  height: '180px',
                }}
              />
            ))}
          </div>
        ) : myPolls.length === 0 ? (
          /* Empty state */
          <div
            className="text-center py-16 px-4 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-mid)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              You haven't created any polls yet
            </h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Create a poll to start gathering votes and manage its status here.
            </p>
            <Link
              href="/polls/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              }}
            >
              Create Your First Poll
            </Link>
          </div>
        ) : (
          /* Poll cards grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myPolls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false;
              const isClosed = poll.closed || isExpired;

              return (
                <div
                  key={poll.id}
                  className="rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {poll.title}
                      </h3>
                      <span
                        className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={
                          isClosed
                            ? { background: 'var(--danger-light)', color: 'var(--danger)' }
                            : { background: 'var(--success-light)', color: 'var(--success)' }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isClosed ? 'var(--danger)' : 'var(--success)' }} />
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-4 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                      <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{totalVotes} Total Votes</span>
                      <span>•</span>
                      <span>{poll.options.length} Options</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <Link
                      href={`/polls/${poll.id}`}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </Link>

                    {!poll.closed && (
                      <button
                        onClick={() => handleClose(poll.id)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        Close
                      </button>
                    )}

                    <button
                      onClick={() => handleReset(poll.id)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Reset Votes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
