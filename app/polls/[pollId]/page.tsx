'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

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
  imageUrl?: string | null;
  votes: number;
}

interface PollResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Results {
  pollId: string;
  title: string;
  totalVotes: number;
  results: PollResult[];
  closed: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

export default function PollDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser } = useStore();
  const pollId = params.pollId as string;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      });

    // Fetch poll
    fetch(`/api/polls/${pollId}`)
      .then(res => res.json())
      .then(data => {
        if (data.poll) {
          setPoll(data.poll);
        } else {
          setError('Poll not found');
        }
        setLoading(false);
      });

    // Fetch initial results
    fetch(`/api/polls/${pollId}/results`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          setResults(data.results);
        }
      });

    // Set up SSE for real-time updates
    const eventSource = new EventSource(`/api/polls/${pollId}/results?live=true`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [pollId, setUser]);

  // Expiry Countdown Timer
  useEffect(() => {
    const targetDateStr = results?.expiresAt || poll?.expiresAt;
    if (!targetDateStr) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(targetDateStr).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [results?.expiresAt, poll?.expiresAt]);

  useEffect(() => {
    if (user && poll) {
      // Check if user has voted
      fetch(`/api/polls/${pollId}/has-voted`)
        .then(res => res.json())
        .then(data => {
          if (data.hasVoted) {
            setHasVoted(true);
          }
        });
    }
  }, [user, poll, pollId]);

  const handleVote = async (optionId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (hasVoted || poll?.closed) {
      return;
    }

    try {
      setVoting(true);
      setError('');

      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();

      if (data.error) {
        if (data.error === 'You have already voted') {
          setHasVoted(true);
        }
        setError(data.error);
        setVoting(false);
        return;
      }

      if (data.success) {
        setHasVoted(true);
        // Immediately fetch updated results to be instant
        fetch(`/api/polls/${pollId}/results`)
          .then(res => res.json())
          .then(resData => {
            if (resData.results) {
              setResults(resData.results);
            }
          });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading poll details...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
          style={{ border: '1px solid var(--border-color)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--navy-deep)' }}>Poll Not Found</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>

          {/* Live indicator badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live SSE Connected
          </div>
        </div>

        {/* Main Poll Card */}
        <div
          className="rounded-2xl p-6 sm:p-10 transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    poll.closed || (timeLeft?.isExpired)
                      ? { background: 'var(--danger-light)', color: 'var(--danger)' }
                      : { background: 'var(--success-light)', color: 'var(--success)' }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: poll.closed || (timeLeft?.isExpired) ? 'var(--danger)' : 'var(--success)' }} />
                  {poll.closed || (timeLeft?.isExpired) ? 'Closed Poll' : 'Active Poll'}
                </span>

                {/* Live Countdown Timer Badge */}
                {timeLeft && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      timeLeft.isExpired
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {timeLeft.isExpired ? (
                      <span>Expired</span>
                    ) : (
                      <span>
                        Expires in: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                      </span>
                    )}
                  </span>
                )}

                {hasVoted && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    You Voted
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--navy-deep)' }}>
                {poll.title}
              </h1>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in"
              style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Stats Bar */}
          {results && (
            <div className="flex items-center justify-between pb-6 mb-8 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Total Votes</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--navy-deep)' }}>{results.totalVotes}</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div>
                  <div className="text-[11px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Created On</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {(poll.expiresAt || results?.expiresAt) && (
                  <div>
                    <div className="text-[11px] uppercase font-semibold text-amber-700">Closing Time</div>
                    <div className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {new Date(poll.expiresAt || results!.expiresAt!).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options & Results List */}
          <div className="space-y-4">
            {poll.options.map((option) => {
              const resultArray = Array.isArray(results) ? results : (results?.results || []);
              const result = resultArray.find((r: any) => r.optionId === option.id);
              const percentage = result?.percentage || 0;
              const votes = result?.votes || 0;

              return (
                <div
                  key={option.id}
                  className="p-5 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-primary)',
                  }}
                >
                  {/* Image/GIF Preview if available */}
                  {option.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden max-h-56 bg-slate-100 border border-slate-200">
                      <img
                        src={option.imageUrl}
                        alt={option.text}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                      {option.text}
                    </span>
                    {results && (
                      <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--blue-brand)' }}>
                        <span>{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
                          {percentage}%
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar background fill */}
                  {results && (
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
                        }}
                      />
                    </div>
                  )}

                  {/* Vote Action / State */}
                  {!hasVoted && !poll.closed && !(timeLeft?.isExpired) && user && (
                    <button
                      onClick={() => handleVote(option.id)}
                      disabled={voting}
                      className="mt-1 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
                      }}
                    >
                      {voting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Vote for this option</span>
                        </>
                      )}
                    </button>
                  )}

                  {!user && !poll.closed && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                        Log in to cast your vote
                      </Link>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Closed notice */}
          {poll.closed && (
            <div className="mt-6 p-4 rounded-xl text-center text-sm font-medium bg-slate-100 text-slate-600">
              Voting has ended for this poll.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
