'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, setUser } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { name: 'Explore', href: '/explore', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> },
  ];

  if (user) {
    navLinks.push(
      { name: 'Dashboard', href: '/dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
      { name: 'Create', href: '/polls/new', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> }
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full pointer-events-none`}
      style={{
        background: 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 50%, rgba(255, 255, 255, 0) 100%)',
        paddingTop: '24px', 
        paddingBottom: '70px',
        boxShadow: 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex justify-between items-start">
          
          {/* Logo - Left */}
          <Link href="/" className="flex items-center group w-1/4 pt-1">
            <span className="text-slate-900 font-extrabold text-2xl tracking-tight">
              VoteFlow<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Nav Links - Center */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-x-8 gap-y-4 w-2/4 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2.5 text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User / Auth - Right */}
          <div className="hidden md:flex items-center justify-end gap-6 w-1/4 pt-1">
            {user ? (
              <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <button className="text-slate-500 hover:text-blue-600 transition-colors hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative group pt-1 pb-1">
                  <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-white/50 transition-colors border border-transparent hover:border-blue-200 cursor-pointer">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-extrabold shadow-sm bg-gradient-to-br from-blue-500 to-blue-600"
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 transition-transform group-hover:rotate-180">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                      <Link href="/settings" className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                        Edit Profile
                      </Link>
                      <Link href="/my-votes" className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                        My Votes
                      </Link>
                      <Link href="/faq" className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                        FAQ
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-2.5 text-[15px] text-white font-extrabold rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition-colors duration-200 cursor-pointer pt-1"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-slate-800 rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-4 h-0.5 bg-slate-800 rounded-full mt-1.5 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-slate-800 rounded-full mt-1.5 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 absolute left-0 right-0 top-full bg-white border-b border-slate-100 ${
          mobileOpen ? 'max-h-[600px] opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-5 space-y-2">
          {navLinks.map((link) => (
             <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-4 text-[15px] font-bold text-slate-700 hover:text-blue-600 rounded-2xl hover:bg-blue-50 transition-colors">
                <span className="text-blue-500">{link.icon}</span>
                {link.name}
             </Link>
          ))}

          <div className="pt-6 mt-5 border-t border-slate-100 space-y-4">
            {user ? (
              <div className="flex items-center justify-between px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-extrabold bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[15px] font-extrabold text-slate-800">{user.username}</span>
                </div>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-4 text-[15px] font-bold text-slate-700 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all shadow-sm">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-4 text-[15px] text-white font-extrabold rounded-2xl shadow-md transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
