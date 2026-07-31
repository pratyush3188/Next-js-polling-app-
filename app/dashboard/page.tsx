'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

interface Poll {
  id: string;
  title: string;
  options: { id: string; text: string; votes: number }[];
  creatorId: string;
  createdAt: string;
  expiresAt?: string | null;
  closed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.polls) {
          setPolls(data.polls);
        }
        setLoading(false);
      });
  }, [router, setUser]);

  if (!user || loading) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const myPolls = polls.filter(p => p.creatorId === user.id);
  const totalVotesReceived = myPolls.reduce((sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0), 0);
  
  const isPollClosed = (p: Poll) => p.closed || (p.expiresAt ? new Date() > new Date(p.expiresAt) : false);

  const activePollsCount = myPolls.filter(p => !isPollClosed(p)).length;
  const closedPollsCount = myPolls.filter(p => isPollClosed(p)).length;

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--navy-deep)' }}>
              Analytics Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Welcome back, <span className="font-semibold text-blue-600">{user.username}</span>! Here is an overview of your poll engagement.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/polls/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              }}
            >
              + Create Poll
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Polls Created', value: myPolls.length, icon: '📊', color: '#3B82F6' },
            { label: 'Total Votes Received', value: totalVotesReceived, icon: '🗳️', color: '#10B981' },
            { label: 'Active Polls', value: activePollsCount, icon: '⚡', color: '#6366F1' },
            { label: 'Closed Polls', value: closedPollsCount, icon: '🔒', color: '#8B5CF6' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border transition-all hover:shadow-md"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: 'var(--navy-deep)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Created Polls Section */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--navy-deep)' }}>Recent Created Polls</h2>
            <Link href="/polls/manage" className="text-xs font-semibold text-blue-600 hover:underline">
              Manage All Polls →
            </Link>
          </div>

          {myPolls.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              You haven't created any polls yet.{' '}
              <Link href="/polls/new" className="text-blue-600 font-semibold hover:underline">
                Create your first poll now!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myPolls.slice(0, 5).map(poll => {
                const votesCount = poll.options.reduce((s, o) => s + o.votes, 0);
                const isClosed = isPollClosed(poll);

                return (
                  <div
                    key={poll.id}
                    className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}
                  >
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--navy-deep)' }}>
                        {poll.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {poll.options.length} options • {votesCount} votes • Created {new Date(poll.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          isClosed
                            ? { background: 'var(--danger-light)', color: 'var(--danger)' }
                            : { background: 'var(--success-light)', color: 'var(--success)' }
                        }
                      >
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                      <Link
                        href={`/polls/${poll.id}`}
                        className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Live
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
