'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const HistoryCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      image: '/carousel_charminar.jpg',
      title: 'CHARMINAR',
      subtitle: 'The Heart of Hyderabad',
      description: 'Built in 1591 by Sultan Muhammad Quli Qutb Shah, this iconic monument stands as the eternal symbol of Hyderabad\'s rich heritage and architectural brilliance.',
      year: '1591',
      significance: 'Iconic Monument'
    },
    {
      image: '/carousel_golconda.jpg',
      title: 'GOLCONDA FORT',
      subtitle: 'Fortress of Diamonds',
      description: 'Once the capital of the Qutb Shahi dynasty, this majestic citadel was renowned for its impressive acoustics, diamond trade, and legendary Koh-i-Noor diamond.',
      year: '13th Century',
      significance: 'Royal Fortress'
    },
    {
      image: '/carousel_Chaoumahala_palace_hyderabad.jpg',
      title: 'CHOWMAHALLA PALACE',
      subtitle: 'Palace of the Nizams',
      description: 'The seat of the Asaf Jahi dynasty, this sprawling palace complex showcases the grandeur and opulence of the Nizams who ruled Hyderabad for over two centuries.',
      year: '1750',
      significance: 'Royal Residence'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-gray-100 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm text-yellow-600 uppercase tracking-widest font-medium mb-4">
            TIMELESS EXPERIENCE
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-light text-gray-900 mb-4">
            Explore <span className="text-yellow-600">Architecture</span>
          </h2>
          <p className="text-gray-700 text-xl font-light max-w-2xl mx-auto">
            Journey through centuries of royal legacy and architectural marvels
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative h-[600px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-overlay" />
              </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full p-6 md:p-8"
              >
                <div className="bg-white bg-opacity-98 backdrop-blur-md rounded-xl p-6 md:p-8 max-w-xl shadow-2xl border border-white border-opacity-20">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium mr-4">
                      {slides[currentSlide].year}
                    </div>
                    <div className="text-yellow-600 text-sm uppercase tracking-wide font-medium">
                      {slides[currentSlide].significance}
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 mb-2">
                    {slides[currentSlide].title}
                  </h3>

                  <h4 className="text-yellow-600 text-base md:text-lg font-medium mb-4">
                    {slides[currentSlide].subtitle}
                  </h4>

                  <p className="text-gray-700 leading-relaxed text-sm md:text-base font-light">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-yellow-500 scale-125'
                  : 'bg-gray-400 hover:bg-yellow-400'
                  }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-gray-300 h-1 rounded-full overflow-hidden">
              <motion.div
                className="bg-yellow-500 h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-700">
              <span>{currentSlide + 1} of {slides.length}</span>
              <span className="text-yellow-600">Historical Monuments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoryCarousel;