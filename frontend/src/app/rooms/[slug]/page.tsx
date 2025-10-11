'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, Wifi, Car, Coffee, Tv, Bath, 
  Bed, Eye, X, ChevronLeft, ChevronRight, MapPin,
  Clock, Shield, Star, CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/booking/BookingModal';
import { toast } from 'react-hot-toast';

interface RoomImage {
  url: string;
  alt: string;
  is_primary: boolean;
  order: number;
}

interface Room {
  id: string;
  slug: string;
  title: string;
  description: string;
  room_type: string;
  amenities: string[];
  images: RoomImage[];
  base_price: number;
  max_occupancy: number;
  bed_configuration: string;
  room_size: string;
  floor: string;
  view: string;
  cancellation_policy: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RoomDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [slug]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${slug}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Room not found');
      }
      
      const roomData = await response.json();
      setRoom(roomData);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

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
        return 'Free cancellation up to 24 hours before check-in';
      case 'flexible':
        return 'Flexible cancellation with partial refund';
      case 'non_refundable':
        return 'Non-refundable booking';
      default:
        return 'Standard cancellation policy applies';
    }
  };

  const nextImage = () => {
    if (room) {
      setSelectedImageIndex((prev) => 
        prev === room.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (room) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? room.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-96 bg-muted-beige rounded-lg mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
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
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-serif font-bold text-navy-900 mb-4">
              Room Not Found
            </h1>
            <p className="text-charcoal-600 mb-8">
              The room you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-gold"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-charcoal-600">
              <a href="/" className="hover:text-gold-600">Home</a>
              <span>/</span>
              <a href="/rooms" className="hover:text-gold-600">Rooms</a>
              <span>/</span>
              <span className="text-navy-900 font-medium">{room.title}</span>
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
              <img
                src={room.images[selectedImageIndex]?.url || '/images/rooms/placeholder.jpg'}
                alt={room.images[selectedImageIndex]?.alt || room.title}
                className="w-full h-full object-cover"
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
              
              {/* View All Photos Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>View All Photos ({room.images.length})</span>
              </button>
              
              {/* Image Indicators */}
              {room.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
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
                {room.title}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6 text-charcoal-600">
                <div className="flex items-center space-x-2">
                  <Users size={18} />
                  <span>Up to {room.max_occupancy} guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed size={18} />
                  <span>{room.bed_configuration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={18} />
                  <span>{room.room_size}</span>
                </div>
              </div>

              <p className="text-charcoal-700 text-lg leading-relaxed mb-8">
                {room.description}
              </p>

              {/* Room Features */}
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                  Room Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-charcoal-700">
                    <MapPin className="text-gold-600" size={18} />
                    <span>{room.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-charcoal-700">
                    <Eye className="text-gold-600" size={18} />
                    <span>{room.view}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-charcoal-700">
                    <Bed className="text-gold-600" size={18} />
                    <span>{room.bed_configuration}</span>
                  </div>
                </div>
              </div>

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
                    <span>{getCancellationPolicyText(room.cancellation_policy)}</span>
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
                    ₹{room.base_price.toLocaleString()}
                  </div>
                  <div className="text-charcoal-600">per night</div>
                  <div className="text-sm text-charcoal-500 mt-1">
                    + 18% GST & service charges
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full btn-gold py-4 text-lg font-semibold mb-4"
                >
                  Book Now
                </button>

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
              <img
                src={room.images[selectedImageIndex]?.url || '/images/rooms/placeholder.jpg'}
                alt={room.images[selectedImageIndex]?.alt || room.title}
                className="max-w-full max-h-[80vh] object-contain"
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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={room}
      />
    </div>
  );
}