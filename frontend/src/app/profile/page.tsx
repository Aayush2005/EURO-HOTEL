'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileModal from '@/components/auth/ProfileModal';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-charcoal-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-navy-900 mb-4">
                My Profile
              </h1>
              <p className="text-charcoal-600">
                Manage your account information and preferences
              </p>
            </div>

            {/* Profile Card */}
            <motion.div
              className="premium-card p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-semibold text-navy-900">
                  Account Information
                </h2>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="btn-outline-gold flex items-center space-x-2 px-4 py-2"
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600 bg-opacity-10 rounded-full flex items-center justify-center">
                    <Mail className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Email</p>
                    <p className="text-lg font-medium text-navy-900">{user?.email}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600 bg-opacity-10 rounded-full flex items-center justify-center">
                    <User className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Username</p>
                    <p className="text-lg font-medium text-navy-900">{user?.username}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600 bg-opacity-10 rounded-full flex items-center justify-center">
                    <Phone className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Phone</p>
                    <p className="text-lg font-medium text-navy-900">{user?.phone}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600 bg-opacity-10 rounded-full flex items-center justify-center">
                    <Calendar className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Member Since</p>
                    <p className="text-lg font-medium text-navy-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 bg-opacity-10 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Account Status</p>
                    <p className="text-lg font-medium text-green-600 capitalize">{user?.status}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button className="premium-card p-6 text-left hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Booking History</h3>
                <p className="text-charcoal-600">View your past and upcoming reservations</p>
              </button>
              
              <button className="premium-card p-6 text-left hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Preferences</h3>
                <p className="text-charcoal-600">Manage your stay preferences and notifications</p>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}