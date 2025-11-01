import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PhilosophySection from '@/components/PhilosophySection';
import RestaurantFeatures from '@/components/RestaurantFeatures';
import HistoryCarousel from '@/components/HistoryCarousel';
import GallerySection from '@/components/GallerySection';
import EventsSection from '@/components/EventsSection';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import HomeClientWrapper from '@/components/HomeClientWrapper';
import PageWrapper from '@/components/PageWrapper';

export default function Home() {
  return (
    <PageWrapper>
      <div className="min-h-screen">
        <Header />
        <HeroSection />
        <PhilosophySection />
        <HistoryCarousel />
        <GallerySection />
        <RestaurantFeatures />
        <EventsSection />
        <BookingForm />
        <Footer />
        <HomeClientWrapper />
      </div>
    </PageWrapper>
  );
}