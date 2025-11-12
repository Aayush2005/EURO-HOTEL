'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import LazyImage from '@/components/LazyImage';
import OrbitalLoader from '@/components/OrbitalLoader';
import RoomCardSkeleton from '@/components/skeletons/RoomCardSkeleton';
import RoomCard from '@/components/RoomCard';
// import { useProgressiveLoading } from '@/hooks/useInfiniteScroll'; // Temporarily disabled for debugging
import { heroImages } from '@/lib/cloudinary';


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




export default function RoomsPage() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    guests: 1,
    room_type: ''
  });

  // Temporarily use simple state to debug the issue
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleRooms = filteredRooms.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRooms.length;
  const isLoadingMore = false;
  
  const loadMoreItems = () => {
    setVisibleCount(prev => Math.min(prev + 3, filteredRooms.length));
  };

  console.log('Visible rooms:', visibleRooms.length);
  console.log('Filtered rooms:', filteredRooms.length);
  console.log('All rooms:', allRooms.length);
  
  // Debug: Check for duplicates in the arrays
  const visibleRoomIds = visibleRooms.map(r => r.id);
  const uniqueVisibleIds = [...new Set(visibleRoomIds)];
  if (visibleRoomIds.length !== uniqueVisibleIds.length) {
    console.error('Duplicates found in visibleRooms:', visibleRoomIds.length, 'total,', uniqueVisibleIds.length, 'unique');
  }
  
  // Reset visible count when filtered rooms change
  useEffect(() => {
    setVisibleCount(3);
  }, [filteredRooms]);

  const applyFilters = () => {
    let filtered = allRooms;
    
    if (filters.room_type) {
      filtered = filtered.filter(room => room.room_type === filters.room_type);
    }
    
    if (filters.guests > 1) {
      filtered = filtered.filter(room => room.max_occupancy >= filters.guests);
    }
    
    setFilteredRooms(filtered);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/rooms`;
        console.log('Environment API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('Fetching rooms from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const roomsData = await response.json();
          console.log('Fetched rooms:', roomsData.length, 'rooms');
          setAllRooms(roomsData);
          setFilteredRooms(roomsData);
        } else {
          console.error('API request failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setAllRooms([]);
          setFilteredRooms([]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setAllRooms([]);
        setFilteredRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // Only process URL filters after rooms are loaded
    if (allRooms.length === 0) return;
    
    console.log('All rooms:', allRooms.length);
    console.log('Filtered rooms:', filteredRooms.length);
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilters = {
      start_date: urlParams.get('start_date') || '',
      end_date: urlParams.get('end_date') || '',
      guests: parseInt(urlParams.get('guests') || '1'),
      room_type: urlParams.get('room_type') || ''
    };

    console.log('URL filters:', urlFilters);

    if (urlFilters.start_date || urlFilters.end_date || urlFilters.room_type || urlFilters.guests > 1) {
      setFilters(urlFilters);
      let filtered = allRooms;
      if (urlFilters.room_type) {
        filtered = filtered.filter(room => room.room_type === urlFilters.room_type);
      }
      if (urlFilters.guests > 1) {
        filtered = filtered.filter(room => room.max_occupancy >= urlFilters.guests);
      }
      console.log('Filtered rooms after URL params:', filtered.length);
      setFilteredRooms(filtered);
    }
  }, [allRooms]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = { start_date: '', end_date: '', guests: 1, room_type: '' };
    setFilters(defaultFilters);
    setFilteredRooms(allRooms);
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



  if (loading) {
    return (
      <>
        <OrbitalLoader overlay />
        <div className="min-h-screen bg-off-white">
          <Header />
          <div className="pt-24 pb-16">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
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
            <LazyImage
              publicId={heroImages.rooms}
              alt="Luxury Hotel Rooms"
              width={1200}
              height={600}
              className="w-full h-full object-cover"
              priority
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
            {/* <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <p className="text-charcoal-600">{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available</p>
              <p className="text-sm text-gray-500">Debug: All rooms: {allRooms.length}, Visible rooms: {visibleRooms.length}, Loading: {loading.toString()}</p>
            </motion.div> */}

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleRooms.map((room, index) => {
                // Debug: Check for duplicates
                const duplicateCount = visibleRooms.filter(r => r.id === room.id).length;
                if (duplicateCount > 1) {
                  console.warn(`Duplicate room found: ${room.id} appears ${duplicateCount} times`);
                }
                
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    index={index}
                    getRoomTypeLabel={getRoomTypeLabel}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreItems}
                  disabled={isLoadingMore}
                  className="btn-gold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2">
                      <OrbitalLoader size="sm" />
                      <span>Loading more rooms...</span>
                    </div>
                  ) : (
                    'Load More Rooms'
                  )}
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoadingMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {[...Array(3)].map((_, i) => (
                  <RoomCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredRooms.length === 0 && !loading && (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-2">
                  {allRooms.length === 0 ? 'Unable to load rooms' : 'No rooms found'}
                </h3>
                <p className="text-charcoal-600 mb-6">
                  {allRooms.length === 0 
                    ? 'Please check your connection and try again, or contact support if the issue persists.'
                    : 'Try adjusting your search criteria or dates'
                  }
                </p>
                {allRooms.length === 0 ? (
                  <button onClick={() => window.location.reload()} className="btn-gold">
                    Retry
                  </button>
                ) : (
                  <button onClick={clearFilters} className="btn-gold">Clear Filters</button>
                )}
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </SimplePageWrapper>
  );
}
