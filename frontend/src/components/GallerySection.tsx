'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const GallerySection = () => {
  const galleryImages = [
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-10.jpg?updatedAt=1777049081289",
      title: "Royal Suite",
      category: "Accommodation"
    },
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-17.jpg?updatedAt=1777049081430",
      title: "Heritage Facade",
      category: "Architecture"
    },
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-12.jpg?updatedAt=1777049081347",
      title: "Aesthetic Gallery",
      category: "Events"
    },
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-13.jpg?updatedAt=1777049081345",
      title: "Executive Boardroom",
      category: "Business"
    },
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-3.jpg?updatedAt=1777049081345",
      title: "Luxury Interiors",
      category: "Design"
    },
    {
      url: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-6.jpg?updatedAt=1777049081301",
      title: "Historic Charminar",
      category: "Heritage"
    }
  ];

  return (
    <section className="py-20 bg-off-white">
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
            VISUAL JOURNEY
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light bg-navy-900 mb-4">
            Experience <span className="text-gold-600">Luxury</span>
          </h2>
          <p className="bg-navy-900 text-xl font-light max-w-2xl mx-auto">
            Every corner tells a story of elegance and grandeur
          </p>
        </motion.div>

        {/* Gallery Grid */}
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
              whileHover={{ scale: 1.05 }}
            >
              <div className={`relative ${
                index === 0 || index === 3 ? 'h-64 md:h-96' : 'h-32 md:h-44'
              }`}>
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy-900 bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <motion.div 
                  className="absolute bottom-4 left-4 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="text-xs text-gold-400 uppercase tracking-wide mb-1">
                    {image.category}
                  </div>
                  <h3 className="font-serif text-sm md:text-base font-medium">
                    {image.title}
                  </h3>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="btn-outline-gold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            VIEW FULL GALLERY
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;