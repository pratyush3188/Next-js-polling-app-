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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>;
  }

  const myPolls = polls.filter(p => p.creatorId === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Manage My Polls</h1>
            <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : myPolls.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">You haven't created any polls yet.</p>
            <Link href="/polls/new" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Your First Poll
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {myPolls.map((poll) => (
              <div key={poll.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {new Date(poll.createdAt).toLocaleDateString()}
                      {poll.closed && <span className="ml-2 text-red-600">(Closed)</span>}
                    </p>
                  </div>
                  <Link
                    href={`/polls/${poll.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Poll
                  </Link>
                </div>
                <div className="flex gap-2">
                  {!poll.closed && (
                    <button
                      onClick={() => handleClose(poll.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Close Poll
                    </button>
                  )}
                  <button
                    onClick={() => handleReset(poll.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Reset Votes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

