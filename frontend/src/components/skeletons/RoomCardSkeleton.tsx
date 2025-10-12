'use client';

const RoomCardSkeleton = () => {
  return (
    <div className="premium-card overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-64 bg-gradient-to-r from-muted-beige via-soft-gray to-muted-beige">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        {/* Badge skeleton */}
        <div className="absolute top-4 left-4">
          <div className="bg-muted-beige/60 rounded-full w-20 h-6"></div>
        </div>
        {/* Rating skeleton */}
        <div className="absolute top-4 right-4">
          <div className="bg-muted-beige/60 rounded w-16 h-6"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-muted-beige rounded w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-muted-beige rounded w-full"></div>
          <div className="h-4 bg-muted-beige rounded w-2/3"></div>
        </div>
        
        {/* Features */}
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-muted-beige rounded w-20"></div>
          <div className="h-4 bg-muted-beige rounded w-16"></div>
        </div>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-muted-beige rounded w-16"></div>
          <div className="h-6 bg-muted-beige rounded w-20"></div>
          <div className="h-6 bg-muted-beige rounded w-14"></div>
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-6 bg-muted-beige rounded w-24"></div>
            <div className="h-4 bg-muted-beige rounded w-16"></div>
          </div>
          <div className="h-10 bg-muted-beige rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;