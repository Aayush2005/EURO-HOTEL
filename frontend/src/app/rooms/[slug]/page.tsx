'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, Wifi, Car, Coffee, Tv, Bath, 
  Bed, Eye, X, ChevronLeft, ChevronRight, MapPin,
  Clock, Shield, Star, CheckCircle
} from 'lucide-react';
import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';
import BookingModal from '@/components/booking/BookingModal';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import LazyImage from '@/components/LazyImage';
import OrbitalLoader from '@/components/OrbitalLoader';
import ComingSoon from '@/components/ComingSoon';
import { PAGE_CONFIG } from '@/lib/page-config';
import { getRoomImages as getRoomImageUrls } from '@/lib/room-images';


interface RoomImage {
  publicId: string;
  alt: string;
  is_primary: boolean;
  order: number;
}

interface Room {
  room_type: string;
  room_base_price: number;
  tax_percent: number;
  room_final_price: number;
  max_occupancy: number;
  available_rooms: number;
  amenities: string[];
  description: string;
  images: RoomImage[];
}





const buildRoomImages = (roomType: string): RoomImage[] =>
  getRoomImageUrls(roomType).map((url, index) => ({
    publicId: url,
    alt: `${roomType} room view ${index + 1}`,
    is_primary: index === 0,
    order: index + 1,
  }));

export default function RoomDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Check if room details are disabled
  if (PAGE_CONFIG.ROOM_DETAILS_DISABLED) {
    return (
      <ComingSoon
        title="Room Details"
        message={PAGE_CONFIG.ROOM_DETAILS_MESSAGE}
        backLink="/rooms"
        backText="Back to Rooms"
      />
    );
  }
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/rooms/${slug}`,
          { headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' } }
        );

        if (response.ok) {
          const roomData = await response.json();
          roomData.images = buildRoomImages(roomData.room_type);
          setRoom(roomData);
        } else {
          setRoom(null);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [slug]);


  useEffect(() => {
    if (!room || !isAutoPlaying || room.images.length <= 1) return;

    // Use a single timeout for the full duration instead of frequent updates
    const timeout = setTimeout(() => {
      setSelectedImageIndex((current) => 
        current === room.images.length - 1 ? 0 : current + 1
      );
    }, 5000);

    // Update progress smoothly with requestAnimationFrame
    let animationFrame: number;
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / 5000) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress < 100 && isAutoPlaying) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };
    
    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(timeout);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [room, isAutoPlaying, selectedImageIndex]);


  useEffect(() => {
    setProgress(0);
  }, [selectedImageIndex]);



  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={20} />;
    if (amenityLower.includes('tv')) return <Tv size={20} />;
    if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return <Coffee size={20} />;
    if (amenityLower.includes('bathroom') || amenityLower.includes('bath')) return <Bath size={20} />;
    if (amenityLower.includes('bed')) return <Bed size={20} />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car size={20} />;
    return <CheckCircle size={20} />;
  };

  const getCancellationPolicyText = (policy: string) => {
    switch (policy) {
      case 'free_24h':
        return 'Free cancellation up to 48 hours before check-in';
      case 'flexible':
        return 'Flexible cancellation with partial refund';
      case 'non_refundable':
        return 'Non-refundable booking';
      default:
        return 'Standard cancellation policy applies';
    }
  };

  const nextImage = useCallback(() => {
    if (room) {
      setIsAutoPlaying(false);
      setSelectedImageIndex((prev) => 
        prev === room.images.length - 1 ? 0 : prev + 1
      );
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  }, [room]);

  const prevImage = useCallback(() => {
    if (room) {
      setIsAutoPlaying(false);
      setSelectedImageIndex((prev) => 
        prev === 0 ? room.images.length - 1 : prev - 1
      );
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  }, [room]);

  const goToImage = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setSelectedImageIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, []);

  if (loading) {
    return (
      <>
        <OrbitalLoader overlay />
        <div className="min-h-screen bg-off-white">
          <SolidHeader />
          <div className="pt-24 pb-16">
            <div className="container mx-auto px-6">
              <div className="animate-pulse">
                <div className="h-96 bg-gradient-to-r from-muted-beige via-soft-gray to-muted-beige rounded-lg mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-8 bg-muted-beige rounded mb-4"></div>
                    <div className="h-4 bg-muted-beige rounded mb-2"></div>
                    <div className="h-4 bg-muted-beige rounded mb-2"></div>
                    <div className="h-4 bg-muted-beige rounded w-3/4"></div>
                  </div>
                  <div className="h-64 bg-muted-beige rounded"></div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-off-white">
        <SolidHeader />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-serif font-bold text-navy-900 mb-4">
              Room Not Found
            </h1>
            <p className="text-charcoal-600 mb-8">
              The room you're looking for doesn't exist or couldn't be loaded. Please check the URL or try again later.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.history.back()}
                className="btn-outline-gold"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-gold"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <SimplePageWrapper>
      <div className="min-h-screen bg-off-white">
        <SolidHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-charcoal-600">
              <a href="/" className="hover:text-gold-600">Home</a>
              <span>/</span>
              <a href="/rooms" className="hover:text-gold-600">Rooms</a>
              <span>/</span>
              <span className="text-navy-900 font-medium">{room.room_type}</span>
            </div>
          </nav>

          {/* Hero Gallery */}
          <motion.div
            className="relative mb-8 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-96 md:h-[500px]">
              <LazyImage
                key={selectedImageIndex}
                publicId={room.images[selectedImageIndex]?.publicId || getRoomImageUrls(room.room_type)[0]}
                alt={room.images[selectedImageIndex]?.alt || room.room_type}
                width={1200}
                height={500}
                className="w-full h-full object-cover"
                priority
              />
              
              {/* Image Navigation */}
              {room.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Progress Indicators */}
              {room.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className="relative w-12 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
                    >
                      <div 
                        className={`absolute left-0 top-0 h-full bg-gold-400 rounded-full transition-all duration-300 ${
                          index === selectedImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ 
                          width: index === selectedImageIndex ? `${Math.round(progress)}%` : '0%',
                          willChange: index === selectedImageIndex ? 'width' : 'auto'
                        }}
                      />
                      {index !== selectedImageIndex && (
                        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Details */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-serif font-bold text-navy-900 mb-4">
                {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} Room
              </h1>

              <div className="flex items-center space-x-6 mb-6 text-charcoal-600">
                <div className="flex items-center space-x-2">
                  <Users size={18} />
                  <span>Up to {room.max_occupancy} guests</span>
                </div>
              </div>

              <p className="text-charcoal-700 text-lg leading-relaxed mb-8">
                {room.description}
              </p>


              {/* Amenities */}
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3 text-charcoal-700">
                      <div className="text-gold-600">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                  Policies
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-charcoal-700">
                    <Clock className="text-gold-600" size={18} />
                    <span>Check-in: 2:00 PM | Check-out: 12:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-3 text-charcoal-700">
                    <Shield className="text-gold-600" size={18} />
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Booking Card */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="premium-card p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-navy-900 mb-2">
                    ₹{room.room_base_price.toLocaleString()}
                  </div>
                  <div className="text-charcoal-600">per night</div>
                  <div className="text-sm text-charcoal-500 mt-1">
                    + {room.tax_percent}% GST & service charges
                  </div>
                </div>

                <a
                  href="tel:+917729900091"
                  className="w-full btn-gold py-4 text-lg font-semibold mb-4 text-center block"
                >
                  For Booking Call +91 77299 00091
                </a>

                <div className="text-center text-sm text-charcoal-600 mb-4">
                  Free cancellation • No booking fees
                </div>

                <div className="border-t border-muted-beige pt-4">
                  <div className="flex items-center justify-center space-x-1 text-gold-600 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <div className="text-center text-sm text-charcoal-600">
                    Luxury Heritage Experience
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gold-400 z-10"
            >
              <X size={32} />
            </button>
            
            <div className="relative">
              <LazyImage
                publicId={room.images[selectedImageIndex]?.publicId || getRoomImageUrls(room.room_type)[0]}
                alt={room.images[selectedImageIndex]?.alt || room.room_type}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
                priority
              />
              
              {room.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gold-400 p-2"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gold-400 p-2"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center mt-4 text-white">
              {selectedImageIndex + 1} of {room.images.length}
            </div>
          </div>
        </div>
      )}

      </div>
    </SimplePageWrapper>
  );
}