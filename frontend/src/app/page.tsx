'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HeritageSection from '@/components/HeritageSection';
import HistoryCarousel from '@/components/HistoryCarousel';
import GallerySection from '@/components/GallerySection';
import EventsSection from '@/components/EventsSection';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
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
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HeritageSection />
      <HistoryCarousel />
      <GallerySection />
      <EventsSection />
      <BookingForm />
      <Footer />
      
      {/* Auth Modal for redirected users */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
}