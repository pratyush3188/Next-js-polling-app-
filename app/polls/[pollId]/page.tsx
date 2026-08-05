'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  creatorUsername?: string;
  createdAt: string;
  expiresAt?: string | null;
  closed: boolean;
  isPrivate?: boolean;
  hasPin?: boolean;
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
  creatorId?: string;
  creatorUsername?: string;
  totalVotes: number;
  results: PollResult[];
  closed: boolean;
  createdAt: string;
  expiresAt?: string | null;
  isPrivate?: boolean;
  hasPin?: boolean;
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerifying, setPinVerifying] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
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
          if (data.poll.hasPin) {
            const userKey = user?.id || 'guest';
            const isUnlocked = sessionStorage.getItem(`unlocked_poll_${userKey}_${data.poll.id}`);
            if (!isUnlocked) {
              setIsPinLocked(true);
            } else {
              setIsPinLocked(false);
            }
          }
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
    if (poll?.hasPin) {
      const userKey = user?.id || 'guest';
      const isUnlocked = sessionStorage.getItem(`unlocked_poll_${userKey}_${poll.id}`);
      if (!isUnlocked) {
        setIsPinLocked(true);
      } else {
        setIsPinLocked(false);
      }
    }

    if (user && pollId) {
      fetch(`/api/polls/${pollId}/has-voted`)
        .then(res => res.json())
        .then(data => {
          if (data.hasVoted) {
            setHasVoted(true);
          }
        });
    }
  }, [user, poll?.id, poll?.hasPin, pollId]);

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

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin) return;

    setPinVerifying(true);
    setPinError('');

    try {
      const res = await fetch(`/api/polls/${pollId}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin })
      });

      const data = await res.json();
      if (data.success) {
        const userKey = user?.id || 'guest';
        sessionStorage.setItem(`unlocked_poll_${userKey}_${pollId}`, 'true');
        setIsPinLocked(false);
      } else {
        setPinError(data.error || 'Incorrect PIN code');
      }
    } catch (err) {
      setPinError('Failed to verify PIN');
    } finally {
      setPinVerifying(false);
    }
  };

  if (isPinLocked) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-purple-100 relative overflow-hidden animate-fade-in"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 mb-3">
            🔒 Private PIN Protected Poll
          </span>

          <h2 className="text-2xl font-extrabold mb-2 text-slate-900 leading-tight">
            {poll?.title || 'Security Access Required'}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter the 4-digit PIN set by the poll creator to view options and cast your vote.
          </p>

          {pinError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
              {pinError}
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full py-3 px-4 text-center tracking-[1em] text-2xl font-mono font-extrabold rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-purple-50/30 text-purple-950"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={pinVerifying || enteredPin.length < 4}
              className="w-full py-3.5 px-4 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {pinVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  <span>Unlock Poll</span>
                </>
              )}
            </button>
          </form>
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

                {/* Share Poll Button */}
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer ml-auto"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span>Share Poll</span>
                </button>
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
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Created By</div>
                  <div className="text-xs font-bold text-blue-600">
                    @{poll.creatorUsername || results?.creatorUsername || 'Anonymous'}
                  </div>
                </div>

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
                    <div
                      onClick={() => setZoomedImage(option.imageUrl || null)}
                      className="mb-4 rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-200 shadow-md cursor-zoom-in group relative flex items-center justify-center min-h-[220px] max-h-[380px] sm:max-h-[460px] w-full"
                    >
                      <img
                        src={option.imageUrl}
                        alt={option.text}
                        className="w-full h-full object-contain max-h-[380px] sm:max-h-[460px] transition-transform duration-300 group-hover:scale-[1.02]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        <span>Click to enlarge</span>
                      </div>
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

      {/* Share & QR Code Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center relative">
            <button
              onClick={() => setIsShareOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="7" width="3" height="3"/>
                <rect x="14" y="7" width="3" height="3"/>
                <rect x="7" y="14" width="3" height="3"/>
              </svg>
            </div>

            <h3 className="font-extrabold text-xl text-slate-900 mb-1">Share This Poll</h3>
            <p className="text-xs text-slate-500 mb-6">Scan QR Code with any phone camera or share via 1-click links</p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-md mb-6 inline-block">
              <QRCodeSVG
                value={typeof window !== 'undefined' ? window.location.href : ''}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Share Actions */}
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Vote on this poll: "${poll.title}" 👉 ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.45-1.161z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Twitter / X Share */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote on this poll: "${poll.title}"`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter / X</span>
                </a>
              </div>

              {/* Copy Link Button */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span>Copy Poll Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
          <img
            src={zoomedImage}
            alt="Enlarged view"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
