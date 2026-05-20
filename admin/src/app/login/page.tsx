'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #C9A227 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #C9A227, #A6841F)', boxShadow: '0 8px 32px rgba(201,162,39,0.4)' }}>
            <span className="text-3xl font-serif font-bold text-navy-900">E</span>
          </div>
          <h1 className="text-2xl font-serif text-white tracking-widest">EURO HOTEL</h1>
          <p className="text-gold-400 text-sm mt-1 tracking-wider uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #C9A227, #D4B332, #C9A227)' }} />
          <div className="p-8">
            <h2 className="text-xl font-semibold text-navy-900 mb-1">Welcome back</h2>
            <p className="text-charcoal-400 text-sm mb-6">Sign in to manage your hotel</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-charcoal-700 placeholder:text-charcoal-400 text-sm transition-all"
                  style={{ ['--tw-ring-color' as string]: '#C9A227' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#C9A227'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  placeholder="admin@eurohotel.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-charcoal-700 placeholder:text-charcoal-400 text-sm transition-all"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C9A227'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0">!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-navy-900 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
                style={{ background: loading ? '#D4A843' : 'linear-gradient(135deg, #C9A227, #D4B332)', boxShadow: '0 4px 12px rgba(201,162,39,0.3)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-charcoal-500 text-xs mt-6">
          Euro Hotel · Admin Access Only
        </p>
      </div>
    </div>
  );
}
