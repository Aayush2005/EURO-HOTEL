'use client';

import { useState, useRef, useEffect } from 'react';
import { getCloudinaryUrl } from '@/lib/cloudinary';

interface LazyImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
  priority?: boolean;
  onLoad?: () => void;
  fallbackSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  publicId,
  alt,
  width,
  height,
  className = '',
  quality = 'auto',
  format = 'auto',
  crop = 'fill',
  gravity = 'auto',
  priority = false,
  onLoad,
  fallbackSrc
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const imageUrl = hasError && fallbackSrc 
    ? fallbackSrc 
    : getCloudinaryUrl(publicId, { width, height, quality, format, crop, gravity });

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted-beige via-soft-gray to-muted-beige animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-muted-beige flex items-center justify-center">
          <div className="text-charcoal-500 text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;