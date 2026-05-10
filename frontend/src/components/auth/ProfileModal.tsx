'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';
import { countryCodes } from '@/data/countryCodes';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function splitStoredPhone(stored: string | null): { dialCode: string; number: string } {
  if (!stored) return { dialCode: '+91', number: '' };
  const sorted = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (stored.startsWith(c.dialCode)) {
      return { dialCode: c.dialCode, number: stored.slice(c.dialCode.length) };
    }
  }
  return { dialCode: '+91', number: stored };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.full_name || '');
      const { dialCode: dc, number } = splitStoredPhone(user?.phone ?? null);
      setDialCode(dc);
      setPhoneNumber(number);
    }
  }, [isOpen, user]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextName = fullName.trim();
    if (nextName && nextName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        full_name: nextName || null,
        phone: phoneNumber.trim() ? `${dialCode}${phoneNumber.trim()}` : null,
      });
      toast.success('Profile updated');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="profile-modal-container flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="profile-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="profile-modal-content w-full max-w-md bg-off-white rounded-lg shadow-2xl my-8 mx-auto"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <h2 className="text-2xl font-serif font-semibold text-navy-900">My Profile</h2>
              <button
                onClick={onClose}
                className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors"
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center pt-6 pb-2">
              <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white text-xl font-semibold select-none">
                {initials}
              </div>
              <p className="mt-2 text-sm text-charcoal-500">{user?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email — read only */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg bg-muted-beige text-charcoal-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    maxLength={150}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Phone Number</label>
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
                      maxLength={12}
                      autoComplete="tel-national"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ProfileModal;
