'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, Search, Star } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimplePageWrapper from '@/components/SimplePageWrapper';


interface Room {
  id: string;
  slug: string;
  title: string;
  description: string;
  room_type: string;
  amenities: string[];
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
  }>;
  base_price: number;
  max_occupancy: number;
  bed_configuration: string;
  room_size: string;
  view: string;
  available: boolean;
}


const STATIC_ROOMS: Room[] = [
  {
    id: "1",
    slug: "deluxe-heritage-suite",
    title: "Deluxe Heritage Suite",
    description: "Experience the grandeur of Hyderabadi royalty in our spacious Deluxe Heritage Suite. Featuring traditional décor with modern amenities, this suite offers a perfect blend of luxury and comfort.",
    room_type: "suite",
    amenities: [
      "Free Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service", 
      "Flat Screen TV", "Private Bathroom", "Balcony with City View", 
      "Coffee/Tea Maker", "Safe", "Telephone"
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
        alt: "Deluxe Heritage Suite",
        is_primary: true
      }
    ],
    base_price: 8500,
    max_occupancy: 4,
    bed_configuration: "1 King Bed + 1 Sofa Bed",
    room_size: "45 sqm",
    view: "City View",
    available: true
  },
  {
    id: "2",
    slug: "royal-presidential-suite",
    title: "Royal Presidential Suite",
    description: "The epitome of luxury, our Royal Presidential Suite offers unparalleled elegance and space. Perfect for special occasions and VIP guests seeking the ultimate in comfort and prestige.",
    room_type: "presidential",
    amenities: [
      "Free Wi-Fi", "Air Conditioning", "Mini Bar", "24/7 Room Service", 
      "Smart TV", "Marble Bathroom", "Private Terrace", "Espresso Machine", 
      "Personal Safe", "Telephone", "Butler Service", "Jacuzzi"
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
        alt: "Royal Presidential Suite",
        is_primary: true
      }
    ],
    base_price: 15000,
    max_occupancy: 6,
    bed_configuration: "1 King Bed + 2 Single Beds",
    room_size: "80 sqm",
    view: "Panoramic City View",
    available: true
  },
  {
    id: "3",
    slug: "classic-deluxe-room",
    title: "Classic Deluxe Room",
    description: "Our Classic Deluxe Room combines traditional Hyderabadi hospitality with contemporary comfort. Ideal for business travelers and couples seeking a refined stay experience.",
    room_type: "deluxe",
    amenities: [
      "Free Wi-Fi", "Air Conditioning", "Mini Fridge", "Room Service", 
      "LED TV", "Private Bathroom", "Work Desk", "Coffee/Tea Maker", 
      "Safe", "Telephone"
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
        alt: "Classic Deluxe Room",
        is_primary: true
      }
    ],
    base_price: 5500,
    max_occupancy: 3,
    bed_configuration: "1 Queen Bed",
    room_size: "30 sqm",
    view: "Garden View",
    available: true
  },
  {
    id: "4",
    slug: "standard-comfort-room",
    title: "Standard Comfort Room",
    description: "Perfect for budget-conscious travelers, our Standard Comfort Room offers all essential amenities with the signature Euro Hotel hospitality and service excellence.",
    room_type: "standard",
    amenities: [
      "Free Wi-Fi", "Air Conditioning", "Room Service", "TV", 
      "Private Bathroom", "Work Desk", "Coffee/Tea Maker", "Telephone"
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        alt: "Standard Comfort Room",
        is_primary: true
      }
    ],
    base_price: 3500,
    max_occupancy: 2,
    bed_configuration: "1 Double Bed",
    room_size: "25 sqm",
    view: "Street View",
    available: true
  }
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(STATIC_ROOMS);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    guests: 1,
    room_type: ''
  });

  const applyFilters = () => {
    let filteredRooms = STATIC_ROOMS;
    
    // Filter by room type
    if (filters.room_type) {
      filteredRooms = filteredRooms.filter(room => room.room_type === filters.room_type);
    }
    
    // Filter by guest capacity
    if (filters.guests > 1) {
      filteredRooms = filteredRooms.filter(room => room.max_occupancy >= filters.guests);
    }
    
    setRooms(filteredRooms);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilters = {
      start_date: urlParams.get('start_date') || '',
      end_date: urlParams.get('end_date') || '',
      guests: parseInt(urlParams.get('guests') || '1'),
      room_type: urlParams.get('room_type') || ''
    };

    if (urlFilters.start_date || urlFilters.end_date || urlFilters.room_type || urlFilters.guests > 1) {
      setFilters(urlFilters);
      let filteredRooms = STATIC_ROOMS;
      if (urlFilters.room_type) {
        filteredRooms = filteredRooms.filter(room => room.room_type === urlFilters.room_type);
      }
      if (urlFilters.guests > 1) {
        filteredRooms = filteredRooms.filter(room => room.max_occupancy >= urlFilters.guests);
      }
      setRooms(filteredRooms);
    }
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = { start_date: '', end_date: '', guests: 1, room_type: '' };
    setFilters(defaultFilters);
    setRooms(STATIC_ROOMS);
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return 'Standard Room';
      case 'deluxe': return 'Deluxe Room';
      case 'suite': return 'Suite';
      case 'presidential': return 'Presidential Suite';
      default: return type;
    }
  };

  const getPrimaryImage = (images: Room['images'], roomType: string) => {
    const imageMap: { [key: string]: string } = {
      'standard': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'deluxe': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      'suite': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop',
      'presidential': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop'
    };

    if (!images || images.length === 0) {
      return imageMap[roomType] || imageMap['standard'];
    }

    const primary = images.find(img => img.is_primary);
    const imageUrl = primary?.url || images[0]?.url;


    if (!imageUrl || imageUrl.startsWith('/images/')) {
      return imageMap[roomType] || imageMap['standard'];
    }

    return imageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted-beige rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-muted-beige rounded-lg h-96"></div>
                ))}
              </div>
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
        <Header />

        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=600&fit=crop"
              alt="Luxury Hotel Rooms"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-overlay"></div>
          </motion.div>

          <motion.div
            className="relative z-10 text-center text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="text-sm text-gold-400 uppercase tracking-widest font-medium mb-4">
              LUXURY ACCOMMODATIONS
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-light mb-4 text-shadow">
              Rooms & <span className="text-gold-400">Suites</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light max-w-3xl mx-auto">
              Experience luxury and comfort in our carefully curated accommodations
            </p>
          </motion.div>
        </section>

        <main className="py-20">
          <div className="container mx-auto px-6">

            {/* Filters */}
            <motion.div className="premium-card p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy-900 flex items-center">
                  <Filter className="mr-2" size={20} /> Filter Rooms
                </h3>
                <button onClick={clearFilters} className="text-gold-600 hover:text-gold-500 text-sm font-medium">Clear All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Room Type</label>
                  <select value={filters.room_type} onChange={(e) => handleFilterChange('room_type', e.target.value)} className="w-full px-4 py-2 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                    <option value="">All Types</option>
                    <option value="standard">Standard Room</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="suite">Suite</option>
                    <option value="presidential">Presidential Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Max Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={16} />
                    <select value={filters.guests} onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))} className="w-full pl-10 pr-4 py-2 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button onClick={applyFilters} className="w-full btn-gold py-2 flex items-center justify-center space-x-2"><Search size={16} /><span>Filter Rooms</span></button>
                </div>
              </div>
            </motion.div>

            {/* Results Count */}
            <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <p className="text-charcoal-600">{rooms.length} room{rooms.length !== 1 ? 's' : ''} available</p>
            </motion.div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <motion.div key={room.id} className="premium-card overflow-hidden group cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }} whileHover={{ y: -4 }}>
                  <Link href={`/rooms/${room.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img src={getPrimaryImage(room.images, room.room_type)} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gold-600 text-navy-900 px-3 py-1 rounded-full text-sm font-medium">{getRoomTypeLabel(room.room_type)}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        <Star size={12} fill="currentColor" /><span className="text-xs">Luxury</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-serif font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">{room.title}</h3>
                      <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                      <div className="flex items-center justify-between text-sm text-charcoal-600 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1"><Users size={14} /><span>{room.max_occupancy} guests</span></div>
                          <div>{room.room_size}</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((a, i) => <span key={i} className="text-xs bg-muted-beige text-charcoal-600 px-2 py-1 rounded">{a}</span>)}
                          {room.amenities.length > 3 && <span className="text-xs text-charcoal-500">+{room.amenities.length - 3} more</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-navy-900">₹{room.base_price.toLocaleString()}</div>
                          <div className="text-sm text-charcoal-600">per night</div>
                        </div>
                        <div className="btn-gold px-4 py-2 text-sm group-hover:bg-gold-500 transition-colors">View Details</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {rooms.length === 0 && !loading && (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-2">No rooms found</h3>
                <p className="text-charcoal-600 mb-6">Try adjusting your search criteria or dates</p>
                <button onClick={clearFilters} className="btn-gold">Clear Filters</button>
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </SimplePageWrapper>
  );
}
