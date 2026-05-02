'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LazyImage from '@/components/LazyImage';
import { resolveRoomCardImage } from '@/lib/room-images';

interface Room {
  room_type: string;
  room_base_price: number;
  tax_percent: number;
  room_final_price: number;
  available_rooms: number;
  amenities: string[];
  description: string;
  image_urls?: unknown;
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
      <Link href={`/rooms/${room.room_type}`}>
      <div className="relative h-64 overflow-hidden">
        <LazyImage
          publicId={resolveRoomCardImage(room.room_type, room.image_urls)}
          alt={getRoomTypeLabel(room.room_type)}
          width={400}
          height={256}
          className="w-full h-full object-cover transition-transform duration-500"
        />
        {room.available_rooms === 0 && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold mb-2 text-navy-900">
          {getRoomTypeLabel(room.room_type)}
        </h3>
        <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>
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
              ₹{room.room_base_price.toLocaleString()}
            </div>
            <div className="text-sm text-charcoal-600">per night + taxes</div>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm bg-gray-200 text-gray-400 cursor-not-allowed rounded"
          >
            Book Now
          </button>
        </div>
      </div>
      </Link>
    </motion.div>
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;