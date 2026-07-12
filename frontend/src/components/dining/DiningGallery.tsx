'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

// Placeholder dining imagery (swap for real Cloudinary assets later).
const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=900&q=80',
    title: 'Fine Dining Hall',
    category: 'Ambience',
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80',
    title: 'Signature Plating',
    category: 'Cuisine',
  },
  {
    url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80',
    title: 'Artisan Coffee',
    category: 'Beverages',
  },
  {
    url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=900&q=80',
    title: 'Private Dining',
    category: 'Experiences',
  },
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
    title: 'Evening Service',
    category: 'Ambience',
  },
  {
    url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=80',
    title: 'Fresh Desserts',
    category: 'Cuisine',
  },
];

const DiningGallery = () => {
  return (
    <section className="py-20 bg-muted-beige">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">
            Gallery
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900">
            Dining <span className="text-gold-600">Gallery</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                index === 0 || index === 3 ? 'md:row-span-2' : ''
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <div
                className={`relative ${
                  index === 0 || index === 3 ? 'h-64 md:h-96' : 'h-32 md:h-44'
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy-900/40 group-hover:bg-navy-900/20 transition-all duration-300" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-xs text-gold-400 uppercase tracking-wide mb-1">
                    {image.category}
                  </div>
                  <h3 className="font-serif text-sm md:text-base font-medium">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiningGallery;
