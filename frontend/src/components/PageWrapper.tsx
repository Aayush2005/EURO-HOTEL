'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './LoadingScreen';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Immediate transition to eliminate white screen
    setShowContent(true);
  };

  // Preload critical resources
  useEffect(() => {
    const preloadImages = [
      '/logoVector.png',
      '/logoText.png',
      '/carousel_Chaoumahala_palace_hyderabad.jpg',
      '/carousel_charminar.jpg',
      '/carousel_golconda.jpg'
    ];

    const imagePromises = preloadImages.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    // Wait for images to load or timeout after 3 seconds
    Promise.allSettled(imagePromises).then(() => {
      // Minimum loading time of 2 seconds for better UX
      setTimeout(() => {
        if (isLoading) {
          // Loading screen will handle the completion
        }
      }, 2000);
    });
  }, [isLoading]);

  return (
    <div className="relative">
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      </AnimatePresence>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageWrapper;