import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center py-12 px-4 text-center relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Radial background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #3B82F6, transparent)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Animated 404 badge */}
        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl font-black text-white shadow-lg animate-float"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}
        >
          404
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--navy-deep)' }}>
          Page Not Found
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          Oops! The page or poll you are looking for doesn't exist, has been removed, or the URL might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/polls/new"
            className="w-full sm:w-auto px-6 py-3 font-semibold text-sm rounded-xl border transition-all duration-200 hover:bg-slate-50"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              background: 'var(--bg-primary)',
            }}
          >
            Create a Poll
          </Link>
        </div>
      </div>
    </div>
  );
}
