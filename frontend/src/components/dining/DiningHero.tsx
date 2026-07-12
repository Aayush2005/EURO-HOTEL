'use client';

import { motion } from 'framer-motion';

// Placeholder background (swap for a real Cloudinary/ImageKit asset later).
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80';

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const DiningHero = () => {
  return (
    <section className="relative h-[640px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center text-white px-4 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-sm text-gold-400 uppercase tracking-widest font-medium mb-4">
          Luxury Dining Experience
        </div>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 text-shadow leading-tight">
          Good Food, <br className="hidden md:block" />
          <span className="text-gold-400">Great Moments</span>
        </h1>
        <p className="text-lg md:text-xl opacity-90 font-light max-w-2xl mx-auto mb-10">
          Experience exceptional cuisine and unforgettable moments, crafted by our
          award-winning chefs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => scrollToId('reserve')}
            className="btn-gold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book a Table
          </motion.button>
          <motion.button
            onClick={() => scrollToId('signature-flavors')}
            className="btn-outline-gold text-white border-white hover:text-navy-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Menu
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default DiningHero;
