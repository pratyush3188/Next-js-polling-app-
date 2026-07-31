'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

interface OptionInput {
  text: string;
  imageUrl: string;
  mediaType: 'none' | 'image' | 'gif';
}

const DEFAULT_GIFS = [
  { id: '1', title: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: '2', title: 'Popcorn', url: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif' },
  { id: '3', title: 'Clapping', url: 'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif' },
  { id: '4', title: 'Laughing', url: 'https://media.giphy.com/media/10JhvoLVm7j6Zq/giphy.gif' },
  { id: '5', title: 'Thinking', url: 'https://media.giphy.com/media/4JVTF9zR9BicshFAb7/giphy.gif' },
  { id: '6', title: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { id: '7', title: 'Celebrating', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { id: '8', title: 'Cat Vibing', url: 'https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif' },
  { id: '9', title: 'Fire Hype', url: 'https://media.giphy.com/media/nrXif4YjgXgMTizwYX/giphy.gif' },
];

export default function NewPoll() {
  const router = useRouter();
  const { user } = useStore();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('never');
  const [customDateTime, setCustomDateTime] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { text: '', imageUrl: '', mediaType: 'none' },
    { text: '', imageUrl: '', mediaType: 'none' }
  ]);
  const [activeGifModalIndex, setActiveGifModalIndex] = useState<number | null>(null);
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        }
      });
  }, [router]);

  const addOption = () => {
    setOptions([...options, { text: '', imageUrl: '', mediaType: 'none' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOptionText = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  // High-performance image compressor (Forces JPEG 500px, shrinking 5MB+ images down to <40KB)
  const compressImage = (file: File, maxWidth = 500, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject('Failed to process image file');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject('Failed to read image file');
      reader.readAsDataURL(file);
    });
  };

  const handleLocalImageUpload = async (index: number, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      setError('');
      const compressedDataUrl = await compressImage(file);
      const newOptions = [...options];
      newOptions[index].imageUrl = compressedDataUrl;
      newOptions[index].mediaType = 'image';
      setOptions(newOptions);
    } catch (err: any) {
      setError('Failed to process local image file');
    }
  };

  const selectGif = (index: number, gifUrl: string) => {
    const newOptions = [...options];
    newOptions[index].imageUrl = gifUrl;
    newOptions[index].mediaType = 'gif';
    setOptions(newOptions);
    setActiveGifModalIndex(null);
    setCustomGifUrl('');
  };

  const clearMedia = (index: number) => {
    const newOptions = [...options];
    newOptions[index].imageUrl = '';
    newOptions[index].mediaType = 'none';
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const validOptions = options
        .filter(opt => opt.text.trim() !== '')
        .map(opt => ({
          text: opt.text.trim(),
          imageUrl: opt.imageUrl.trim() || null
        }));

      if (validOptions.length < 2) {
        setError('At least 2 option titles are required');
        setLoading(false);
        return;
      }

      let calculatedExpiresAt: string | null = null;
      if (duration === '1h') calculatedExpiresAt = new Date(Date.now() + 1 * 3600 * 1000).toISOString();
      else if (duration === '6h') calculatedExpiresAt = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
      else if (duration === '24h') calculatedExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      else if (duration === '3d') calculatedExpiresAt = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
      else if (duration === '7d') calculatedExpiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      else if (duration === 'custom' && customDateTime) calculatedExpiresAt = new Date(customDateTime).toISOString();

      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          options: validOptions,
          expiresAt: calculatedExpiresAt
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.success) {
        router.push(`/polls/${data.poll.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-10 transition-all duration-300 relative"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Poll
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--navy-deep)' }}>
              Create a New Poll
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Add local photos or pick reaction GIFs for your poll options.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in"
              style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                Poll Question / Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is your favorite reaction?"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                Poll Options (Minimum 2)
              </label>
              
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="p-4 rounded-2xl border bg-slate-50/50 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex gap-2.5 items-center">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--blue-tint-light)', color: 'var(--blue-brand)' }}>
                        {index + 1}
                      </span>
                      
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOptionText(index, e.target.value)}
                        placeholder={`Option ${index + 1} Title`}
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        style={{ borderColor: 'var(--border-color)' }}
                        required
                      />

                      <label className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700 border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>Local Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLocalImageUpload(index, e.target.files?.[0] || null)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setActiveGifModalIndex(index)}
                        className="px-3 py-2 rounded-xl border bg-purple-50 hover:bg-purple-100 border-purple-200 transition-all text-xs font-bold text-purple-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>GIF</span>
                      </button>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2.5 rounded-xl transition-colors text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Remove Option"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {option.imageUrl && (
                      <div className="relative pl-9 flex items-center gap-4">
                        <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm group">
                          <img
                            src={option.imageUrl}
                            alt="Selected media"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => clearMedia(index)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-600 cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 capitalize">
                          {option.mediaType} Selected
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                style={{ borderColor: 'var(--border-color)', color: 'var(--blue-brand)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Option
              </button>
            </div>

            {/* Expiry Duration Selector */}
            <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border-light)' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Poll Duration / Expiry</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Never', value: 'never' },
                  { label: '1 Hour', value: '1h' },
                  { label: '6 Hours', value: '6h' },
                  { label: '24 Hours', value: '24h' },
                  { label: '3 Days', value: '3d' },
                  { label: '7 Days', value: '7d' },
                  { label: 'Custom Time', value: 'custom' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDuration(item.value)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      duration === item.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {duration === 'custom' && (
                <div className="pt-2 animate-fade-in">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Select Exact Closing Date & Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    required
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Poll...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Publish Poll</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {activeGifModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Select a GIF</h3>
                <p className="text-xs text-slate-500">Pick from trending reactions or paste a custom GIF link</p>
              </div>
              <button
                onClick={() => setActiveGifModalIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customGifUrl}
                  onChange={(e) => setCustomGifUrl(e.target.value)}
                  placeholder="Or paste custom GIF link (https://...)"
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    if (customGifUrl.trim()) {
                      selectGif(activeGifModalIndex, customGifUrl.trim());
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer"
                >
                  Use Link
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Trending Reaction GIFs
              </span>
              <div className="grid grid-cols-3 gap-3">
                {DEFAULT_GIFS.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => selectGif(activeGifModalIndex, gif.url)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-slate-100"
                  >
                    <img
                      src={gif.url}
                      alt={gif.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] font-bold text-white leading-tight">
                        {gif.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
