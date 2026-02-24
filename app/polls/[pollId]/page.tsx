'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  createdAt: string;
  closed: boolean;
}

interface PollOption {
  id: string;
  text: string;
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
        // Results will update via SSE
      }
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading poll...</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-red-600">{error}</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Poll Details</h1>
            <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{poll.title}</h2>
          
          {poll.closed && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              This poll is closed
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {results && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Total Votes: <span className="font-semibold">{results.totalVotes}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            {poll.options.map((option) => {
              const result = results?.results.find(r => r.optionId === option.id);
              const percentage = result?.percentage || 0;
              const votes = result?.votes || 0;

              return (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{option.text}</span>
                    {results && (
                      <span className="text-sm text-gray-600">
                        {votes} vote{votes !== 1 ? 's' : ''} ({percentage}%)
                      </span>
                    )}
                  </div>
                  
                  {results && (
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}

                  {!hasVoted && !poll.closed && user && (
                    <button
                      onClick={() => handleVote(option.id)}
                      disabled={voting}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {voting ? 'Voting...' : 'Vote'}
                    </button>
                  )}

                  {!user && !poll.closed && (
                    <p className="mt-2 text-sm text-gray-600">
                      <a href="/login" className="text-blue-600 hover:underline">
                        Login to vote
                      </a>
                    </p>
                  )}

                  {hasVoted && (
                    <p className="mt-2 text-sm text-green-600">You have voted</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

