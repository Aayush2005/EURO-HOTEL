'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import DiningHero from '@/components/dining/DiningHero';
import WelcomeRestaurant from '@/components/dining/WelcomeRestaurant';
import SignatureFlavors from '@/components/dining/SignatureFlavors';
import BaristaSection from '@/components/dining/BaristaSection';
import DiningGallery from '@/components/dining/DiningGallery';
import ReserveTable from '@/components/dining/ReserveTable';
import GuestTestimonials from '@/components/dining/GuestTestimonials';

const DiningPage = () => {
  return (
    <SimplePageWrapper>
      <div className="min-h-screen bg-off-white">
        <Header />
        <DiningHero />
        <WelcomeRestaurant />
        <SignatureFlavors />
        <BaristaSection />
        <DiningGallery />
        <ReserveTable />
        <GuestTestimonials />
        <Footer />
      </div>
    </SimplePageWrapper>
  );
};

export default DiningPage;
