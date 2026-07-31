'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function PollEmbed() {
  const params = useParams();
  const pollId = params.pollId as string;
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/polls/${pollId}/results`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          setResults(data.results);
        }
        setLoading(false);
      });

    // Real-time updates
    const eventSource = new EventSource(`/api/polls/${pollId}/results?live=true`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults(data);
    };

    return () => eventSource.close();
  }, [pollId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl text-center text-xs text-slate-400">
        Loading live poll widget...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-6 bg-white rounded-xl text-center text-xs text-red-500">
        Poll not found.
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-2xl border shadow-sm max-w-md mx-auto font-sans" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-base text-slate-900 leading-snug">{results.title}</h3>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 flex-shrink-0">
          Live Poll
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {results.results.map((opt) => (
          <div key={opt.optionId} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{opt.text}</span>
              <span className="text-blue-600">{opt.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${opt.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 border-t border-slate-100">
        <span>{results.totalVotes} total votes</span>
        <a href={`/polls/${pollId}`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
          Vote on Polling App ↗
        </a>
      </div>
    </div>
  );
}
