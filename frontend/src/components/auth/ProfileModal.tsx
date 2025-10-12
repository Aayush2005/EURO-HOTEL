'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, User, Phone, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
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
    username: user?.username || '',
    phone: user?.phone || '',
    current_password: '',
    new_password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      
      if (formData.username !== user?.username) {
        updateData.username = formData.username;
      }
      
      if (formData.phone !== user?.phone) {
        updateData.phone = formData.phone;
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
      
      // Reset password fields
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
      });
      
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form to current user data
    setFormData({
      username: user?.username || '',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-navy-900 bg-opacity-75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-off-white rounded-lg shadow-2xl"
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

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Enter username"
                    pattern="^[a-zA-Z0-9_]+$"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="+1234567890"
                    required
                  />
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
};

export default ProfileModal;