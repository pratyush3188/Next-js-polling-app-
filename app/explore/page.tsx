'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

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
  votes: number;
}

export default function ExplorePage() {
  const { polls, setPolls } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed' | 'most_voted'>('all');

  useEffect(() => {
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.polls) {
          setPolls(data.polls);
        }
        setLoading(false);
      });
  }, [setPolls]);

  // Filtering logic
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false;
    const isClosed = poll.closed || isExpired;

    if (activeTab === 'active') return !isClosed;
    if (activeTab === 'closed') return isClosed;
    return true;
  });

  if (activeTab === 'most_voted') {
    filteredPolls.sort((a, b) => {
      const votesA = a.options.reduce((sum, opt) => sum + opt.votes, 0);
      const votesB = b.options.reduce((sum, opt) => sum + opt.votes, 0);
      return votesB - votesA;
    });
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Public Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: 'var(--navy-deep)' }}>
            Explore All Polls
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Search through live public polls, cast your vote, or view real-time community statistics.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="max-w-3xl mx-auto mb-10 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls by question or topic..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Polls' },
              { id: 'active', label: 'Active' },
              { id: 'most_voted', label: 'Most Voted' },
              { id: 'closed', label: 'Closed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-white shadow-sm'
                    : 'bg-white border text-slate-600 hover:bg-slate-50'
                }`}
                style={
                  activeTab === tab.id
                    ? { background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }
                    : { borderColor: 'var(--border-color)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-shimmer"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  height: '160px',
                }}
              />
            ))}
          </div>
        ) : filteredPolls.length === 0 ? (
          <div
            className="text-center py-16 px-4 rounded-2xl max-w-lg mx-auto"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-100 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--navy-deep)' }}>No matching polls found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or switching filter tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolls.map(poll => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false;
              const isClosed = poll.closed || isExpired;

              let remainingText = null;
              if (poll.expiresAt && !isClosed) {
                const diff = new Date(poll.expiresAt).getTime() - new Date().getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff / (1000 * 60)) % 60);
                if (hours > 24) {
                  const days = Math.floor(hours / 24);
                  remainingText = `${days}d left`;
                } else if (hours > 0) {
                  remainingText = `${hours}h ${mins}m left`;
                } else {
                  remainingText = `${mins}m left`;
                }
              }

              return (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="group block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--navy-deep)' }}>
                      {poll.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          isClosed
                            ? { background: 'var(--danger-light)', color: 'var(--danger)' }
                            : { background: 'var(--success-light)', color: 'var(--success)' }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isClosed ? 'var(--danger)' : 'var(--success)' }} />
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                      {poll.hasPin && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          🔒 PIN
                        </span>
                      )}
                      {remainingText && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          ⏱️ {remainingText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {poll.options.slice(0, 3).map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-sm truncate text-slate-600">{opt.text}</span>
                      </div>
                    ))}
                    {poll.options.length > 3 && (
                      <span className="text-xs text-slate-400">+{poll.options.length - 3} more options</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t text-xs" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="font-semibold text-blue-600">by @{poll.creatorUsername || 'Anonymous'}</span>
                    <span className="font-medium text-slate-500">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
