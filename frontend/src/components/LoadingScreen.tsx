'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import OrbitalLoader from './OrbitalLoader';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

// Predefined sparkle positions to avoid hydration mismatch
const SPARKLE_POSITIONS = [
  { left: 15, top: 20 }, { left: 85, top: 15 }, { left: 25, top: 80 }, { left: 75, top: 85 },
  { left: 10, top: 50 }, { left: 90, top: 45 }, { left: 45, top: 10 }, { left: 55, top: 90 },
  { left: 30, top: 30 }, { left: 70, top: 70 }, { left: 20, top: 60 }, { left: 80, top: 25 },
  { left: 35, top: 75 }, { left: 65, top: 35 }, { left: 12, top: 85 }, { left: 88, top: 12 },
  { left: 40, top: 40 }, { left: 60, top: 60 }, { left: 25, top: 45 }, { left: 75, top: 55 }
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onLoadingComplete, 300); // Reduced delay for smoother transition
          }, 200);
          return 100;
        }
        return prev + 1.5; // Slightly slower for better visual
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  // Calculate circular progress
  const circumference = 2 * Math.PI * 60; // radius = 60
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Don't render on server to avoid hydration issues
  if (!isMounted) return null;

  return (
    <AnimatePresence mode="wait">
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[10001] flex items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(11, 29, 58, 0.95) 0%, rgba(11, 29, 58, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Animated Background Blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-900/95 to-navy-900/90" />
          
          {/* Sparkles Background */}
          <div className="absolute inset-0 overflow-hidden">
            {SPARKLE_POSITIONS.map((position, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + (i % 3), // Deterministic duration based on index
                  repeat: Infinity,
                  delay: i * 0.1, // Deterministic delay based on index
                  ease: "easeInOut"
                }}
              >
                <div className="w-1 h-1 bg-gold-400 rounded-full shadow-lg shadow-gold-400/50" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 text-center">
            {/* Logo Animation */}
            <motion.div
              className="mb-12"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  className="relative w-24 h-24"
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Image
                    src="/logoVector.png"
                    alt="Euro Hotel Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
                <motion.div
                  className="relative w-36 h-18"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <Image
                    src="/logoText.png"
                    alt="EURO LOGO"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <h1 className="text-4xl md:text-6xl font-serif font-light text-white mb-6" 
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                Welcome to <span className="text-gold-400 drop-shadow-2xl">EURO HOTEL</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-light" 
                 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                Where Luxury Meets Heritage
              </p>
            </motion.div>

            {/* Orbital Loader */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <OrbitalLoader />
            </motion.div>

            {/* Loading Text */}
            <motion.div
              className="text-white/80 text-sm font-light tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
            >
              PREPARING YOUR LUXURY EXPERIENCE
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;