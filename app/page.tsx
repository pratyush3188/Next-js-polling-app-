'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function Home() {
  const { user, setUser, polls, setPolls } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      });

    // Fetch polls
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.polls) {
          setPolls(data.polls);
        }
        setLoading(false);
      });
  }, [setUser, setPolls]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Polling App</h1>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <span className="text-gray-700">Hello, {user.username}</span>
                  <Link
                    href="/polls/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Poll
                  </Link>
                  <Link
                    href="/polls/manage"
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Manage Polls
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      setUser(null);
                      window.location.href = '/';
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Polls</h2>
        
        {loading ? (
          <p className="text-gray-600">Loading polls...</p>
        ) : polls.length === 0 ? (
          <p className="text-gray-600">No polls yet. Create one to get started!</p>
        ) : (
          <div className="grid gap-4">
            {polls.map((poll: Poll) => (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {poll.options.length} options
                      {poll.closed && <span className="ml-2 text-red-600">(Closed)</span>}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
