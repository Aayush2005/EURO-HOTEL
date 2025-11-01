'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const RestaurantFeatures = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      title: "Multi-Cuisine Restaurant",
      description: "Savor authentic flavors from Indian, Chinese, and Continental cuisines",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "🍽️"
    },
    {
      title: "Private Dining Areas",
      description: "Two exclusive private dining spaces for 18 & 15 guests",
      image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "🥂"
    },
    {
      title: "Mocktail Bar",
      description: "Refreshing mocktails crafted by expert mixologists",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "🍹"
    },
    {
      title: "Live Kitchen",
      description: "Watch our chefs create culinary masterpieces before your eyes",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "👨‍🍳"
    },
    {
      title: "Ice Cream Parlour",
      description: "Artisanal ice creams and frozen delights",
      image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "🍦"
    },
    {
      title: "Pan Counter",
      description: "Fresh paan and traditional mouth fresheners",
      image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "🌿"
    },
    {
      title: "Take Away Counter",
      description: "Quick service for guests on the go",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "📦"
    },
    {
      title: "24×7 Barista",
      description: "Premium coffee and beverages available round the clock",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      icon: "☕"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            variants={itemVariants}
            className="text-sm text-gold uppercase tracking-widest font-medium mb-4"
          >
            CULINARY EXCELLENCE
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-serif text-4xl md:text-5xl font-light text-navy leading-tight mb-6"
          >
            Restaurant &<br />
            <span className="text-gold">Dining Features</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-charcoal-700 leading-relaxed text-xl font-light max-w-3xl mx-auto"
          >
            Discover our world-class dining facilities designed to satisfy every palate and preference
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group premium-card overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent"></div>
                <div className="absolute top-4 right-4 text-2xl bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-medium text-navy mb-3 group-hover:text-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-charcoal leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Capacity Info */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-navy to-navy text-white p-8 rounded-2xl"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-serif text-3xl font-light text-gold mb-2">33</div>
              <div className="text-sm opacity-80">Total Seating Capacity</div>
              <div className="text-xs opacity-60 mt-1">(18 + 15 in private areas)</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-light text-gold mb-2">3</div>
              <div className="text-sm opacity-80">Cuisine Types</div>
              <div className="text-xs opacity-60 mt-1">Indian, Chinese, Continental</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-light text-gold mb-2">24/7</div>
              <div className="text-sm opacity-80">Service Hours</div>
              <div className="text-xs opacity-60 mt-1">Round the clock dining</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RestaurantFeatures;