'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Placeholder collage imagery (swap for real Cloudinary assets later).
const IMAGES = {
  main: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  topRight: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  bottomRight: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=600&q=80',
};

const WelcomeRestaurant = () => {
  return (
    <section className="py-20 bg-off-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">
              Our Restaurant
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 mb-6">
              Welcome To Our <span className="text-gold-600">Restaurant</span>
            </h2>
            <p className="text-charcoal-700 leading-relaxed mb-5">
              Whether you&apos;re joining us for breakfast, an intimate lunch, or an
              evening dinner or a grand celebration, our chefs create unforgettable
              culinary experiences using carefully selected seasonal ingredients and
              contemporary techniques that honour both tradition and innovation.
            </p>
            <p className="text-charcoal-700 leading-relaxed mb-6">
              From the moment you are seated to the final dessert, every detail of
              your dining journey is crafted with intention, warmth and an unwavering
              commitment to excellence.
            </p>
            <p className="font-serif text-lg italic text-gold-600 mb-8">
              &ldquo;Where comfort meets culinary artistry.&rdquo;
            </p>
            <Link href="/dining/menu">
              <motion.button
                className="btn-gold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Discover Our Menu
              </motion.button>
            </Link>
          </motion.div>

          {/* Image collage */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image src={IMAGES.main} alt="Restaurant interior" fill className="object-cover" />
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="relative h-[8.5rem] sm:h-[11.5rem] rounded-2xl overflow-hidden shadow-lg">
                <Image src={IMAGES.topRight} alt="Plated dish" fill className="object-cover" />
              </div>
              <div className="relative h-[8.5rem] sm:h-[11.5rem] rounded-2xl overflow-hidden shadow-lg">
                <Image src={IMAGES.bottomRight} alt="Table setting" fill className="object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeRestaurant;
