import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #0B1120 100%)',
      }}
    >
      {/* Top border accent */}
      <div
        className="h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center group mb-4">
              <span className="text-white font-extrabold text-2xl tracking-tight">
                VoteFlow<span className="text-blue-500">.</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Create beautiful polls, share with your audience, and watch results come in real-time. Secured with WebAuthn Passkeys.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Explore Directory', href: '/explore' },
                { label: 'Create Poll', href: '/polls/new' },
                { label: 'Manage Polls', href: '/polls/manage' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Resources & Info
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Platform', href: '/about' },
                { label: 'Help & FAQ', href: '/faq' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Connect
            </h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all bg-white/5" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all bg-white/5" aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
            <p className="text-slate-500 text-xs">
              Built with Next.js 16 & Passkeys
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-white/5">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} VoteFlow. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/faq" className="text-slate-500 text-xs hover:text-slate-400">FAQ</Link>
            <Link href="/about" className="text-slate-500 text-xs hover:text-slate-400">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
