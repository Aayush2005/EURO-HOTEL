'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; the SDK picks it up via onAuthStateChange
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      toast.success('Password updated! Please sign in.');
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white">
      <SolidHeader />
      <main className="pt-32 pb-20 flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-serif font-semibold text-navy-900 mb-2">
            Reset Password
          </h1>
          <p className="text-charcoal-600 text-sm mb-8">
            Enter your new password below.
          </p>

          {!isReady ? (
            <p className="text-center text-charcoal-500 text-sm py-8">
              Validating reset link…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Repeat password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
