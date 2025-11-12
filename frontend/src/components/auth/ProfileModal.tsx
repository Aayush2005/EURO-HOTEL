'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, User, Phone, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync form data when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      // No more complex parsing - use separate fields directly
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
      });
      setCountryCode(user.country_code || '+91');
      setPhoneNumber(user.phone || '');
    }
  }, [user, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    current_password: '',
    new_password: '',
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setPhoneNumber(digitsOnly);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCountryCodeChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
  };

  const validatePassword = (password: string) => {
    if (!password) return true; // Optional field
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
      // Validate new password if provided
      if (formData.new_password && !validatePassword(formData.new_password)) {
        toast.error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        return;
      }

      // If changing password, current password is required
      if (formData.new_password && !formData.current_password) {
        toast.error('Current password is required to change password');
        return;
      }

      // Prepare update data (only include changed fields)
      const updateData: any = {};
      
      if (formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      
      if (phoneNumber !== user?.phone || countryCode !== user?.country_code) {
        if (!phoneNumber || phoneNumber.length < 7) {
          toast.error('Please enter a valid phone number');
          return;
        }
        updateData.phone = phoneNumber;
        updateData.country_code = countryCode;
      }
      
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save');
        return;
      }

      await updateProfile(updateData);
      toast.success('Profile updated successfully!');
      
      // Reset password fields only (name and phone will be synced from user state via useEffect)
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form to current user data - let useEffect handle the phone parsing
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      current_password: '',
      new_password: '',
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="profile-modal-container flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="profile-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="profile-modal-content w-full max-w-md bg-off-white rounded-lg shadow-2xl my-8 mx-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <h2 className="text-2xl font-serif font-semibold text-navy-900">Update Profile</h2>
              <button
                onClick={handleClose}
                className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg bg-muted-beige text-charcoal-600 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-charcoal-600">Email cannot be changed</p>
              </div>

              {/* Name */}
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

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Phone Number</label>
                <div className="flex gap-2">
                  <CountryCodeDropdown
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="flex-shrink-0"
                  />
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={phoneNumber}
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
                  {phoneNumber && (
                    <p className="text-xs text-gold-600 font-medium">
                      Full number: {countryCode}{phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t border-muted-beige">
                <h3 className="text-lg font-medium text-charcoal-700 mb-4">Change Password (Optional)</h3>
                
                {/* Current Password */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-charcoal-700">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Enter new password"
                      minLength={8}
                      maxLength={128}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-charcoal-600">
                    Leave blank to keep current password. Must be 8+ characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
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

export default ProfileModal;