'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Coffee, Leaf, Sparkles, Award } from 'lucide-react';

// Placeholder beverage imagery (swap for real Cloudinary assets later).
const baristaItems = [
  {
    name: 'Vanilla Cappuccino',
    rating: 5,
    description:
      'A touch of warm Bourbon vanilla swirled into rich espresso and velvety steamed milk — a comforting classic.',
    image:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Caramel Macchiato',
    rating: 5,
    description:
      'Layers of steamed milk, bold espresso and buttery caramel, finished with a delicate caramel drizzle.',
    image:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Signature Cold Brew',
    rating: 5,
    description:
      'Slow-steeped over 18 hours for a smooth, bold finish — served over ice with a delicate float of cream.',
    image:
      'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/barista.jpeg?updatedAt=1777923240721',
  },
];

const features = [
  { icon: Coffee, label: 'Premium Beans' },
  { icon: Leaf, label: 'Natural Ingredients' },
  { icon: Sparkles, label: 'Freshly Crafted' },
  { icon: Award, label: 'Award Winning' },
];

const BaristaSection = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % baristaItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % baristaItems.length);
    setIsAutoPlaying(false);
  };
  const prev = () => {
    setCurrent((p) => (p - 1 + baristaItems.length) % baristaItems.length);
    setIsAutoPlaying(false);
  };
  const goTo = (i: number) => {
    setCurrent(i);
    setIsAutoPlaying(false);
  };

  const item = baristaItems[current];

  return (
    <section className="py-20 bg-off-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — copy + features */}
            <div>
              <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">
                Crafted By Our Baristas
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 leading-tight mb-2">
                Crafted To Perfection,
              </h2>
              <h2 className="font-serif text-4xl md:text-5xl italic text-gold-600 mb-6">
                Just For You
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-10">
                Our baristas blend passion, craftsmanship, and premium ingredients to
                create unforgettable moments in every cup. Explore signature creations
                crafted for every mood.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gold-600" />
                    </div>
                    <span className="text-xs font-medium text-charcoal-600 uppercase tracking-wide">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — beverage carousel */}
            <div className="relative">
              <div className="relative h-72 md:h-80 w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="relative h-full w-full rounded-full overflow-hidden mx-auto max-w-xs md:max-w-sm"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </motion.div>
                </AnimatePresence>

                {/* Arrows */}
                <button
                  onClick={prev}
                  aria-label="Previous beverage"
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-off-white shadow-md hover:bg-gold-50 text-navy-900 p-2 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next beverage"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-off-white shadow-md hover:bg-gold-50 text-navy-900 p-2 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Detail */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`detail-${current}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-serif text-2xl md:text-3xl font-medium text-navy-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-charcoal-600 text-sm max-w-sm mx-auto mb-3">
                    {item.description}
                  </p>
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? 'fill-gold-500 text-gold-500' : 'text-soft-gray'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center mt-5 gap-2">
                {baristaItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current ? 'w-6 bg-gold-500' : 'w-2 bg-soft-gray hover:bg-gold-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BaristaSection;
