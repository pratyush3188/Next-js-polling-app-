'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Remove component after fade animation
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1B3A5C 50%, #0F172A 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #3B82F6, transparent)',
            top: '10%',
            left: '15%',
            animation: 'float 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[200px] h-[200px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #2563EB, transparent)',
            bottom: '20%',
            right: '20%',
            animation: 'float 5s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <div className="relative">
          {/* Morphing background blob */}
          <div
            className="absolute -inset-4 opacity-20 animate-morph"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              filter: 'blur(20px)',
            }}
          />

          {/* Logo icon */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
            }}
          >
            <svg
              width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 3v18h18" className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }} />
              <path d="M7 16l4-8 4 4 4-6" className="animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }} />
            </svg>
          </div>

          {/* Spinning ring */}
          <div
            className="absolute -inset-3 rounded-2xl animate-spin-slow"
            style={{
              border: '2px solid transparent',
              borderTopColor: 'rgba(59,130,246,0.3)',
              borderRightColor: 'rgba(59,130,246,0.1)',
            }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
          <h1 className="text-white text-xl font-semibold tracking-tight mb-1">
            Polling App
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Real-time Polls
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
              animation: 'progressBar 1.5s ease-out forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
}
