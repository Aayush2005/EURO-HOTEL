'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// ─── Configure slides here ───────────────────────────────────────────────────
const slides = [
  {
    image: 'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-11.jpg?updatedAt=1777049081305',
    title: 'CASUAL DINING',
    subtitle: 'Ground Floor Restaurant & PDR',
    description: 'A vibrant all-day restaurant serving Indian, Continental, and multi-cuisine specialties in a warm, welcoming atmosphere. Our Private Dining Room offers an exclusive setting for corporate meetings and celebrations.',
    tag: 'All-Day Dining',
    significance: 'Ground Floor',
    logo: '/restro_png_logo.png',
  },
  {
    image: 'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-16.jpg?updatedAt=1777049081422',
    title: 'FINE DINING',
    subtitle: 'First Floor Signature Restaurant & PDR',
    description: 'An elegant restaurant with a curated menu of Indian, Continental, and specialty dishes crafted by expert chefs. Perfect for family dinners and corporate events, with a dedicated Private Dining Room for intimate occasions.',
    tag: 'Premium Experience',
    significance: 'First Floor',
    logo: '/restro_png_logo.png',
  },
  {
    image: 'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/barista.jpeg?updatedAt=1777923240721',
    title: 'BARISTA OUTLET',
    subtitle: 'On NH65 Highway',
    description: 'Premium coffee, beverages, and continental bites in a modern café on the NH65 highway — ideal for travelers and coffee lovers. Enjoy sandwiches, pizzas, signature coffees, and mocktails with quick, quality service.',
    tag: 'Highway Café',
    significance: 'NH65',
    logo: null,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const DiningCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => { setCurrentSlide((prev) => (prev + 1) % slides.length); setIsAutoPlaying(false); };
  const prevSlide = () => { setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); setIsAutoPlaying(false); };
  const goToSlide = (index: number) => { setCurrentSlide(index); setIsAutoPlaying(false); };

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
            CULINARY EXPERIENCES
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-light text-gray-900 mb-4">
            Explore <span className="text-yellow-600">Dining</span>
          </h2>
          <p className="text-gray-700 text-xl font-light max-w-2xl mx-auto">
            From casual meals to fine dining — a world of flavours awaits
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Image */}
          <div className="relative h-[420px] md:h-[560px] rounded-2xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/20" />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white p-3 rounded-full transition-all duration-300 group z-10"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white p-3 rounded-full transition-all duration-300 group z-10"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Content Card — below the image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="relative mt-6 bg-white rounded-2xl shadow-lg px-6 py-6 md:px-10 md:py-7"
            >
              {slides[currentSlide].logo && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6 w-24 md:w-28 rounded-lg overflow-hidden">
                  <Image
                    src={slides[currentSlide].logo}
                    alt="logo"
                    width={112}
                    height={56}
                    className="w-full h-auto"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                  {slides[currentSlide].tag}
                </span>
                <span className="text-yellow-600 text-xs uppercase tracking-widest font-medium">
                  {slides[currentSlide].significance}
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 mb-1">
                {slides[currentSlide].title}
              </h3>
              <h4 className="text-yellow-600 text-base font-medium mb-3">
                {slides[currentSlide].subtitle}
              </h4>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-6 space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-yellow-500 scale-125' : 'bg-gray-400 hover:bg-yellow-400'
                }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="bg-gray-300 h-1 rounded-full overflow-hidden">
              <motion.div
                className="bg-yellow-500 h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{currentSlide + 1} of {slides.length}</span>
              <span className="text-yellow-600">Dining Venues</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiningCarousel;
