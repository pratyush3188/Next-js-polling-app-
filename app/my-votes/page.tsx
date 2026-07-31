'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

interface VotedPoll {
  pollId: string;
  title: string;
  closed: boolean;
  votedAt: string;
  myVoteOptionId: string;
  myVoteOptionText: string;
  results: {
    totalVotes: number;
    results: {
      optionId: string;
      text: string;
      votes: number;
      percentage: number;
    }[];
  };
}

export default function MyVotesPage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [polls, setPolls] = useState<VotedPoll[]>([]);
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

    fetch('/api/my-votes')
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
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading voting history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-slate-900">
            Your Voting History.
          </h1>
          <p className="text-base text-slate-500">
            A comprehensive record of every poll you've participated in, alongside real-time results.
          </p>
        </div>

        {/* Polls Activity List */}
        <div className="space-y-6">
          {polls.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2">No votes cast yet</h3>
              <p className="text-slate-500 mb-6 text-sm">You haven't participated in any debates. Your voice matters.</p>
              <Link href="/explore" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Explore Polls
              </Link>
            </div>
          ) : (
            polls.map(poll => (
              <div
                key={poll.pollId}
                className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100/50 transition-colors" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${poll.closed ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                        {poll.closed ? 'Closed' : 'Active'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(poll.votedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 leading-snug pr-4">
                      {poll.title}
                    </h3>
                  </div>
                  <Link
                    href={`/polls/${poll.pollId}`}
                    className="px-5 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-blue-600 text-white flex flex-col sm:flex-row justify-between items-center gap-2 shadow-lg shadow-blue-500/10">
                  <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Your Selection</span>
                  <span className="font-bold text-lg text-center sm:text-right">{poll.myVoteOptionText}</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Live Results</span>
                    <span>{poll.results.totalVotes} Total Votes</span>
                  </div>
                  
                  <div className="space-y-4">
                    {poll.results.results.map(opt => {
                      const isMyVote = opt.optionId === poll.myVoteOptionId;
                      return (
                        <div key={opt.optionId} className="relative">
                          <div className="flex justify-between text-sm mb-1 z-10 relative px-1">
                            <span className={`font-semibold ${isMyVote ? 'text-blue-700' : 'text-slate-700'}`}>
                              {opt.text} {isMyVote && '(You)'}
                            </span>
                            <span className={`font-bold ${isMyVote ? 'text-blue-700' : 'text-slate-500'}`}>
                              {opt.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isMyVote ? 'bg-blue-500' : 'bg-slate-300'}`}
                              style={{ width: `${opt.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
