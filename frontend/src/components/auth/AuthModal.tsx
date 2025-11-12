'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, User, Phone, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'otp' | 'forgot' | 'reset';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { login, register, verifyOTP, resetPasswordRequest, resetPassword } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    otp_code: '',
    new_password: '',
    confirm_password: '',
  });

  const [countryCode, setCountryCode] = useState('+91');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      switch (mode) {
        case 'login':
          await login({ email: formData.email, password: formData.password });
          toast.success('Welcome back!');
          onClose();
          break;

        case 'register':
          if (!validatePassword(formData.password)) {
            toast.error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return;
          }
          if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match. Please re-enter.');
            return;
          }
          if (!formData.phone || formData.phone.length < 7) {
            toast.error('Please enter a valid phone number');
            return;
          }
          await register({
            email: formData.email,
            name: formData.name,
            password: formData.password,
            phone: phoneNumber,
            country_code: countryCode,
          });
          setEmail(formData.email);
          setMode('otp');
          toast.success('Registration successful! Please check your email for verification code.');
          break;

        case 'otp':
          await verifyOTP({ email: email || formData.email, otp_code: formData.otp_code });
          toast.success('Account verified successfully!');
          onClose();
          break;

        case 'forgot':
          await resetPasswordRequest(formData.email);
          setEmail(formData.email);
          setMode('reset');
          toast.success('Reset code sent to your email!');
          break;

        case 'reset':
          if (!validatePassword(formData.new_password)) {
            toast.error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return;
          }
          if (formData.new_password !== formData.confirm_password) {
            toast.error('Passwords do not match. Please re-enter.');
            return;
          }
          await resetPassword({
            email: email || formData.email,
            otp_code: formData.otp_code,
            new_password: formData.new_password,
          });
          toast.success('Password reset successfully!');
          setMode('login');
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      phone: '',
      otp_code: '',
      new_password: '',
      confirm_password: '',
    });
    setEmail('');
    setShowPassword(false);
    setCountryCode('+91');
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'otp': return 'Verify Your Account';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
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
          {/* Backdrop */}
          <motion.div
            className="auth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="auth-modal-content w-full max-w-md bg-off-white rounded-lg shadow-2xl my-8 mx-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <h2 className="text-2xl font-serif font-semibold text-navy-900">{getTitle()}</h2>
              <button
                onClick={handleClose}
                className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'login' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-gold-600 hover:text-gold-500 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </>
              )}

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        minLength={2}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Phone Number</label>
                    <div className="flex gap-2">
                      <CountryCodeDropdown
                        value={countryCode}
                        onChange={setCountryCode}
                        className="flex-shrink-0"
                      />
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onKeyDown={(e) => {
                            // Allow backspace, delete, tab, escape, enter, and arrow keys
                            if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey) ||
                                (e.keyCode === 67 && e.ctrlKey) ||
                                (e.keyCode === 86 && e.ctrlKey) ||
                                (e.keyCode === 88 && e.ctrlKey)) {
                              return;
                            }
                            // Ensure that it is a number and stop the keypress
                            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                              e.preventDefault();
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          placeholder="1234567890"
                          minLength={7}
                          maxLength={15}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-charcoal-600">
                        Enter digits only (no spaces or special characters)
                      </p>
                      {formData.phone && (
                        <p className="text-xs text-gold-600 font-medium">
                          Full number: {countryCode}{formData.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Create password"
                        minLength={8}
                        maxLength={128}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-charcoal-600">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Confirm password"
                        minLength={8}
                        maxLength={128}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {mode === 'otp' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">Verification Code</label>
                  <input
                    type="text"
                    name="otp_code"
                    value={formData.otp_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-charcoal-600 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
              )}

              {mode === 'forgot' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Reset Code</label>
                    <input
                      type="text"
                      name="otp_code"
                      value={formData.otp_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter new password"
                        minLength={8}
                        maxLength={128}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-charcoal-600">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal-700">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Confirm new password"
                        minLength={8}
                        maxLength={128}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Please wait...' : 
                  mode === 'login' ? 'Sign In' :
                  mode === 'register' ? 'Create Account' :
                  mode === 'otp' ? 'Verify Account' :
                  mode === 'forgot' ? 'Send Reset Code' :
                  'Reset Password'
                }
              </button>

              {/* Mode Switchers */}
              <div className="text-center space-y-2">
                {mode === 'login' && (
                  <p className="text-sm text-charcoal-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-gold-600 hover:text-gold-500 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                )}

                {mode === 'register' && (
                  <p className="text-sm text-charcoal-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-gold-600 hover:text-gold-500 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}

                {(mode === 'forgot' || mode === 'reset') && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-gold-600 hover:text-gold-500 font-medium"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default AuthModal;