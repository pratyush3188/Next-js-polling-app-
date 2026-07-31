'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'passkey' | 'voting';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: 'How do I create a new poll?',
    answer: 'Simply log in with your Passkey, click the "Create Poll" button in the navigation bar, enter your question, add 2 or more options, and click Publish!'
  },
  {
    category: 'general',
    question: 'Are poll results updated in real-time?',
    answer: 'Yes! Our platform uses Server-Sent Events (SSE) to push live updates directly to your screen the instant any user casts a vote, without requiring a page refresh.'
  },
  {
    category: 'passkey',
    question: 'What is a Passkey and why do I need one?',
    answer: 'A Passkey is a passwordless authentication standard supported by Apple, Google, and Microsoft. It uses your device’s fingerprint (TouchID), FaceID, or PIN to log you in securely without needing passwords.'
  },
  {
    category: 'passkey',
    question: 'What happens if I lose my device?',
    answer: 'Passkeys are synced automatically across your devices via your Apple iCloud Keychain, Google Password Manager, or Microsoft Account, so you can access your account from any synced device.'
  },
  {
    category: 'voting',
    question: 'Can I vote multiple times on the same poll?',
    answer: 'No. The platform tracks your authenticated session to ensure each user can cast only 1 vote per poll to maintain integrity.'
  },
  {
    category: 'voting',
    question: 'Can I close or reset my polls?',
    answer: 'Yes! As the poll creator, you can go to "My Polls" in the navbar to close a poll to prevent future votes or reset vote counts anytime.'
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [filter, setFilter] = useState<'all' | 'general' | 'passkey' | 'voting'>('all');

  const filteredFaqs = filter === 'all' ? faqs : faqs.filter(f => f.category === filter);

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
            Help Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: 'var(--navy-deep)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Have questions about creating polls, voting, or passkeys? Find answers below.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'general', label: 'General' },
            { id: 'passkey', label: 'Passkeys' },
            { id: 'voting', label: 'Voting' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'text-white shadow-sm'
                  : 'bg-white border text-slate-600 hover:bg-slate-50'
              }`}
              style={
                filter === tab.id
                  ? { background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }
                  : { borderColor: 'var(--border-color)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3 mb-12">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border transition-all overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left font-semibold text-sm flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/50"
                  style={{ color: 'var(--navy-deep)' }}
                >
                  <span>{faq.question}</span>
                  <span className={`transform transition-transform duration-200 text-blue-600 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t pt-3" style={{ borderColor: 'var(--border-light)' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="text-center p-8 rounded-2xl bg-white border" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-base mb-1" style={{ color: 'var(--navy-deep)' }}>Still have questions?</h3>
          <p className="text-xs text-slate-500 mb-4">Start creating your first poll and experience it live in action.</p>
          <Link
            href="/polls/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Create a Poll
          </Link>
        </div>
      </div>
    </div>
  );
}
