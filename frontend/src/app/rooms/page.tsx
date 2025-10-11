'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, Search, Star } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ guests: 1, room_type: '' });

  const fetchRooms = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.guests) params.append('guests', currentFilters.guests.toString());
      if (currentFilters.room_type) params.append('room_type', currentFilters.room_type);

      const res = await fetch(`${API_URL}/api/rooms?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to fetch rooms');

      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => fetchRooms(filters);
  const clearFilters = () => {
    const defaultFilters = { guests: 1, room_type: '' };
    setFilters(defaultFilters);
    fetchRooms(defaultFilters);
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

  const getPrimaryImage = (images: Room['images']) => {
    const primary = images.find(img => img.is_primary);
    return primary?.url || images[0]?.url || '/images/rooms/placeholder.jpg';
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
    <div className="min-h-screen bg-off-white">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-serif font-bold text-navy-900 mb-4">Our Rooms & Suites</h1>
            <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
              Experience luxury and comfort in our carefully curated accommodations, each designed to provide an unforgettable stay at EURO HOTEL.
            </p>
          </motion.div>

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
                    {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Guest{num>1?'s':''}</option>)}
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
            <p className="text-charcoal-600">{rooms.length} room{rooms.length!==1?'s':''} available</p>
          </motion.div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <motion.div key={room.id} className="premium-card overflow-hidden group cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }} whileHover={{ y: -4 }}>
                <Link href={`/rooms/${room.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={getPrimaryImage(room.images)} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    <div className="absolute top-4 left-4">
                      <span className="bg-gold-600 text-navy-900 px-3 py-1 rounded-full text-sm font-medium">{getRoomTypeLabel(room.room_type)}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      <Star size={12} fill="currentColor"/><span className="text-xs">Luxury</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">{room.title}</h3>
                    <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex items-center justify-between text-sm text-charcoal-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1"><Users size={14}/><span>{room.max_occupancy} guests</span></div>
                        <div>{room.room_size}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0,3).map((a,i)=><span key={i} className="text-xs bg-muted-beige text-charcoal-600 px-2 py-1 rounded">{a}</span>)}
                        {room.amenities.length>3 && <span className="text-xs text-charcoal-500">+{room.amenities.length-3} more</span>}
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
  );
}
