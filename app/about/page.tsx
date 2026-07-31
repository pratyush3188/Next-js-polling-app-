import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
            About The Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--navy-deep)' }}>
            Empowering Opinions in Real-Time
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            A modern, lightning-fast polling application built for instant audience engagement, privacy, and real-time data streaming.
          </p>
        </div>

        {/* Story Section */}
        <div
          className="rounded-2xl p-8 border mb-12"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--navy-deep)' }}>
            Our Mission
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
            Traditional polling tools are clunky, rely on insecure passwords, and require manual page refreshes to see results. We designed this platform to eliminate friction completely:
          </p>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            <li>Instant passwordless authentication via biometric Passkeys.</li>
            <li>Live data streaming powered by Server-Sent Events (SSE).</li>
            <li>Clean, responsive light-mode SaaS aesthetics with zero clutter.</li>
          </ul>
        </div>

        {/* Tech Stack Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--navy-deep)' }}>
            Built With Modern Web Standards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 16', desc: 'App Router & Turbopack' },
              { name: 'Tailwind CSS v4', desc: 'Custom Design System' },
              { name: 'WebAuthn', desc: 'SimpleWebAuthn Passkeys' },
              { name: 'SSE Streaming', desc: 'Live Real-time Broadcast' },
              { name: 'Zustand', desc: 'Global State Store' },
              { name: 'TypeScript', desc: 'Type-Safe Architecture' },
              { name: 'React 19', desc: 'Modern Component Layer' },
              { name: 'Inter Font', desc: 'Geometric Typography' },
            ].map((tech, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border text-center transition-all hover:border-blue-300"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="font-bold text-sm text-blue-600 mb-0.5">{tech.name}</div>
                <div className="text-xs text-slate-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/polls/new"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            Create a Poll Now
          </Link>
        </div>
      </div>
    </div>
  );
}
