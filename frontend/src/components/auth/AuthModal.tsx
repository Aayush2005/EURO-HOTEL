'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type Step = 'login' | 'register' | 'verify' | 'forgot' | 'forgot-sent';

const OTP_LENGTH = 6;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, verifySignupOtp, forgotPassword, updateProfile } = useAuth();

  const [step, setStep] = useState<Step>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setEmail('');
      setPassword('');
      setFullName('');
      setDialCode('+91');
      setPhoneNumber('');
      setOtp(Array(OTP_LENGTH).fill(''));
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password);
      setStep('verify');
      toast.success(`Verification code sent to ${email}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < OTP_LENGTH) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    setIsLoading(true);
    try {
      await verifySignupOtp(email, token);
      await updateProfile({
        full_name: fullName.trim() || null,
        phone: `${dialCode}${phoneNumber.trim()}`,
      }).catch(() => {});
      toast.success('Account verified! You are now signed in.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired code. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setStep('forgot-sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await signUp(email, password);
      toast.success('New code sent to your email.');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.message || 'Could not resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-container flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="auth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="auth-modal-content w-full max-w-md bg-off-white rounded-lg shadow-2xl my-8 mx-auto"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <div className="flex items-center gap-3">
                {(step === 'verify' || step === 'forgot' || step === 'forgot-sent') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'verify') { setStep('register'); setOtp(Array(OTP_LENGTH).fill('')); }
                      else { setStep('login'); }
                    }}
                    className="p-1 text-charcoal-600 hover:text-navy-900 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h2 className="text-2xl font-serif font-semibold text-navy-900">
                  {step === 'login' ? 'Sign In'
                    : step === 'register' ? 'Create Account'
                    : step === 'verify' ? 'Verify Email'
                    : step === 'forgot' ? 'Forgot Password'
                    : 'Check Your Email'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors"
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>


            {/* ── Login ── */}
            {step === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('forgot')}
                    className="text-sm text-gold-600 hover:text-gold-700 hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <p className="text-center text-sm text-charcoal-500">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setStep('register')}
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline underline-offset-2">
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {/* ── Forgot Password ── */}
            {step === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="p-6 space-y-5">
                <p className="text-sm text-charcoal-600 text-center">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <p className="text-center text-sm text-charcoal-500">
                  Remembered it?{' '}
                  <button type="button" onClick={() => setStep('login')}
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline underline-offset-2">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── Forgot Sent ── */}
            {step === 'forgot-sent' && (
              <div className="p-6 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <Mail className="text-green-600" size={28} />
                </div>
                <p className="text-charcoal-700">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-medium text-navy-900">{email}</span>.
                  <br />Check your inbox and follow the link.
                </p>
                <p className="text-sm text-charcoal-500">
                  Didn&apos;t get it?{' '}
                  <button
                    type="button"
                    onClick={handleForgotSubmit as any}
                    disabled={isLoading}
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline underline-offset-2 disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full btn-outline-gold py-3"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* ── Register ── */}
            {step === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                      maxLength={150}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeDropdown
                      value={dialCode}
                      onChange={setDialCode}
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="9876543210"
                        required
                        maxLength={12}
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">
                    Password <span className="text-red-500">*</span>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-charcoal-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setStep('login')}
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline underline-offset-2">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── OTP Verify ── */}
            {step === 'verify' && (
              <form onSubmit={handleVerifySubmit} className="p-6 space-y-6">
                <p className="text-sm text-charcoal-600 text-center">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-navy-900">{email}</span>.
                  <br />Enter it below to verify your account.
                </p>

                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-semibold border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent py-3"
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < OTP_LENGTH}
                  className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <p className="text-center text-sm text-charcoal-500">
                  Didn&apos;t receive a code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline underline-offset-2 disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default AuthModal;
