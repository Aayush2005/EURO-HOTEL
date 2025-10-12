'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';
import Link from 'next/link';
import LazyImage from '@/components/LazyImage';
import { getRoomImageId } from '@/lib/cloudinary';

interface Room {
  id: string;
  slug: string;
  title: string;
  description: string;
  room_type: string;
  amenities: string[];
  base_price: number;
  max_occupancy: number;
  room_size: string;
}

interface RoomCardProps {
  room: Room;
  index: number;
  getRoomTypeLabel: (type: string) => string;
}

const RoomCard: React.FC<RoomCardProps> = memo(({ room, index, getRoomTypeLabel }) => {
  return (
    <motion.div 
      className="premium-card overflow-hidden group cursor-pointer" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, delay: 0.1 * (index % 3) }} 
      whileHover={{ y: -4 }}
    >
      <Link href={`/rooms/${room.slug}`}>
        <div className="relative h-64 overflow-hidden">
          <LazyImage
            publicId={getRoomImageId(room.room_type)}
            alt={room.title}
            width={400}
            height={256}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-gold-600 text-navy-900 px-3 py-1 rounded-full text-sm font-medium">
              {getRoomTypeLabel(room.room_type)}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            <Star size={12} fill="currentColor" />
            <span className="text-xs">Luxury</span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-serif font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
            {room.title}
          </h3>
          <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>
          <div className="flex items-center justify-between text-sm text-charcoal-600 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{room.max_occupancy} guests</span>
              </div>
              <div>{room.room_size}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((a, i) => (
                <span key={i} className="text-xs bg-muted-beige text-charcoal-600 px-2 py-1 rounded">
                  {a}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="text-xs text-charcoal-500">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-navy-900">
                ₹{room.base_price.toLocaleString()}
              </div>
              <div className="text-sm text-charcoal-600">per night</div>
            </div>
            <div className="btn-gold px-4 py-2 text-sm group-hover:bg-gold-500 transition-colors">
              View Details
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;