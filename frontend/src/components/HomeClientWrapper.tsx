'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AuthModal from '@/components/auth/AuthModal';

export default function HomeClientWrapper() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected here due to auth requirement
    if (searchParams.get('auth') === 'required') {
      toast.error('Please sign in to access that page');
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      initialMode="login"
    />
  );
}