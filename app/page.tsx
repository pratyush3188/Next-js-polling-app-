'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  votes: number;
}

export default function Home() {
  const { user, setUser, polls, setPolls } = useStore();
  const [loading, setLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch auth status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });

    // Fetch polls
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.polls) setPolls(data.polls);
        setLoading(false);
      });
  }, [setUser, setPolls]);

  // GSAP Animations
  useGSAP(() => {
    // Hero Entrance
    gsap.from('.hero-title-word', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: 'power4.out',
      delay: 0.2
    });

    gsap.from('.hero-sub', {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.hero-btn', {
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      delay: 1.2,
      ease: 'back.out(1.7)'
    });

    // Scroll Animations for Feature Cards
    const cards = gsap.utils.toArray('.feature-card');
    cards.forEach((card: any, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.1
      });
    });

    // Editorial Stats Section
    gsap.from('.stat-number', {
      scrollTrigger: {
        trigger: '.stats-container',
        start: 'top 80%',
      },
      textContent: 0,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      stagger: 0.2
    });

    gsap.from('.stat-block', {
      scrollTrigger: {
        trigger: '.stats-container',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Live Polls Section
    gsap.from('.poll-card-anim', {
      scrollTrigger: {
        trigger: '.polls-container',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Editorial Badge */}
        <div className="hero-sub inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 bg-white/50 backdrop-blur-sm mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-blue-900 uppercase">The New Standard in Polling</span>
        </div>

        {/* Massive Times New Roman Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-[#0F172A] mb-8 overflow-hidden flex flex-wrap justify-center gap-x-4">
          <span className="hero-title-word">Gather</span>
          <span className="hero-title-word">Insights.</span>
          <br />
          <span className="hero-title-word text-blue-600 italic">Beautifully.</span>
        </h1>

        {/* Small Sans-Serif Contrast Text */}
        <p className="hero-sub text-base sm:text-lg text-slate-500 max-w-2xl font-light mb-12">
          Create visually stunning polls, secure them with passkeys, and watch real-time data flow in. An editorial approach to modern feedback.
        </p>

        {/* CTA */}
        <div className="hero-btn flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href={user ? "/polls/new" : "/register"}
            className="px-10 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-xl shadow-blue-600/20"
          >
            {user ? "Craft a Poll" : "Start For Free"}
          </Link>
          <Link
            href="#live-polls"
            className="px-10 py-4 bg-white text-blue-900 font-semibold rounded-2xl hover:bg-slate-50 transition-colors border border-blue-100"
          >
            Explore Live Polls
          </Link>
        </div>
      </section>

      {/* ================= EDITORIAL STATS SECTION ================= */}
      <section className="py-24 border-y border-blue-100/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 stats-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-blue-100">
            <div className="stat-block px-8">
              <div className="font-serif text-5xl font-bold text-blue-600 mb-2 stat-number">100</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Real-Time</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Percent of votes broadcasted instantly via Server-Sent Events. Zero delays.
              </p>
            </div>
            <div className="stat-block px-8 pt-12 md:pt-0">
              <div className="font-serif text-5xl font-bold text-blue-600 mb-2">0</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Passwords</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Utilize WebAuthn passkeys for secure, biometric logins. Forget forgotten passwords.
              </p>
            </div>
            <div className="stat-block px-8 pt-12 md:pt-0">
              <div className="font-serif text-5xl font-bold text-blue-600 mb-2 flex items-center md:justify-start justify-center gap-1">
                <span className="stat-number">24</span>
                <span className="text-3xl text-blue-400">/7</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Availability</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Create and share your polls across the globe seamlessly at any moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID FEATURES ================= */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center md:text-left">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">Designed to perfection.</h2>
          <p className="text-slate-500 max-w-xl text-base mx-auto md:mx-0">
            Every element is crafted in shades of blue, combining high-end typography with modern functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large */}
          <div className="feature-card md:col-span-2 bg-[#E0F2FE] rounded-[2.5rem] p-10 border border-blue-100 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              </div>
              <h3 className="font-serif text-3xl font-bold text-blue-900 mb-4">Live Analytics</h3>
              <p className="text-blue-800/70 text-base max-w-md leading-relaxed">
                Watch the bars fill up as votes come in. Our real-time data engine ensures you never miss a beat.
              </p>
            </div>
            {/* Abstract Graphic */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-300/40 to-transparent rounded-tl-[100px] transition-transform duration-700 group-hover:scale-110" />
          </div>

          {/* Card 2: Vertical */}
          <div className="feature-card bg-blue-600 rounded-[2.5rem] p-10 flex flex-col justify-between text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/50 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-4">Passkeys</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                FaceID & TouchID integration for frictionless, passwordless authentication.
              </p>
            </div>
          </div>

          {/* Card 3: Small */}
          <div className="feature-card bg-white rounded-[2.5rem] p-10 border border-blue-100 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-800 mb-3">Share Instantly</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Generate links and share them across any platform. No signups required for voters.
            </p>
          </div>

          {/* Card 4: Wide */}
          <div className="feature-card md:col-span-2 bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-200 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h3 className="font-serif text-3xl font-bold text-slate-800 mb-4">Editorial Design</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Experience the contrast of classic serif headings mixed with ultra-modern geometric sans-serifs, all wrapped in a cohesive blue palette.
              </p>
            </div>
            <div className="w-full md:w-40 h-28 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center font-serif text-5xl text-slate-200 font-bold italic">
              Aa
            </div>
          </div>
        </div>
      </section>

      {/* ================= LIVE POLLS (Redesigned) ================= */}
      <section id="live-polls" className="py-24 bg-white border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 polls-container">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">Live Debates</h2>
              <p className="text-slate-500 text-base">Join the conversation. Cast your vote today.</p>
            </div>
            {user && (
              <Link href="/polls/new" className="px-6 py-3 bg-[#E0F2FE] text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors">
                + Create Poll
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-50 rounded-[2rem] border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="font-serif text-2xl font-bold text-slate-400 mb-4">Silence.</h3>
              <p className="text-slate-500 text-sm mb-8">No polls have been created yet. Be the visionary.</p>
              <Link href={user ? "/polls/new" : "/register"} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                Start a Poll
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {polls.map((poll: Poll) => {
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
                    href={`/polls/${poll.id}`} 
                    key={poll.id}
                    className="poll-card-anim group block bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${isClosed ? 'bg-red-100 text-red-700' : 'bg-[#E0F2FE] text-blue-700'}`}>
                          {isClosed ? 'Closed' : 'Active'}
                        </span>
                        {remainingText && (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ⏱️ {remainingText}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                      {poll.title}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                      {poll.options.slice(0, 3).map((opt) => (
                        <div key={opt.id} className="flex justify-between text-sm text-slate-600">
                          <span className="truncate pr-4">{opt.text}</span>
                          <span className="font-semibold">{opt.votes}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 text-sm text-slate-400 flex justify-between">
                      <span>Total Votes</span>
                      <span className="font-bold text-slate-900">{totalVotes}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= BOTTOM CALL TO ACTION ================= */}
      <section className="py-32 max-w-5xl mx-auto px-4 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-blue-900 mb-6">Begin the discussion.</h2>
        <p className="text-lg text-blue-800/60 max-w-2xl mx-auto font-light mb-12">
          Experience the most elegant, real-time polling platform ever built. 
        </p>
        <Link
            href={user ? "/polls/new" : "/register"}
            className="inline-block px-12 py-5 bg-blue-900 text-white font-serif text-xl italic rounded-full hover:bg-blue-950 transition-colors shadow-2xl shadow-blue-900/30"
          >
            Create Your Masterpiece
        </Link>
      </section>

    </div>
  );
}
