'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const HeritageSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeOut"
      }
    })
  };

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <motion.div variants={itemVariants}>
              <div className="text-sm text-yellow-600 uppercase tracking-widest font-medium mb-4">
                ROYAL LEGACY
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                <span className="text-gray-900">Hyderabad&apos;s</span><br />
                <span className="text-yellow-600">Heritage</span>
              </h2>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="text-gray-700 leading-relaxed text-xl font-light"
            >
              Where Nizami grandeur meets contemporary luxury, creating an unparalleled experience of royal hospitality
            </motion.p>

            <motion.button
              className="btn-outline-gold"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              DISCOVER LEGACY
            </motion.button>
          </div>

          {/* Visual Story Grid */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 h-[600px]">
              {/* Large Heritage Image */}
              <motion.div
                className="col-span-2 relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-64 relative">
                  <Image
                    src="/room.jpg"
                    alt="Royal Chambers"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                  <motion.div
                    className="absolute bottom-4 left-4 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <h3 className="font-serif text-lg font-medium">Royal Chambers</h3>
                    <p className="text-sm opacity-90">Luxury Redefined</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Architecture Detail */}
              <motion.div
                className="relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-40 relative">
                  <Image
                    src="/CONFERENCE.jpg"
                    alt="Conference Facilities"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h4 className="font-serif text-sm">Executive Spaces</h4>
                  </div>
                </div>
              </motion.div>
              
              {/* Cultural Element */}
              <motion.div
                className="relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-40 relative">
                  <Image
                    src="/EVENT.jpg"
                    alt="Event Spaces"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h4 className="font-serif text-sm">Grand Events</h4>
                  </div>
                </div>
              </motion.div>
              
              {/* Stats Overlay */}
              <motion.div
                className="col-span-2 bg-navy-900 text-white p-6 rounded-lg flex justify-around items-center"
                variants={cardVariants}
              >
                {[
                  { number: '1591', label: 'Founded' },
                  { number: '400+', label: 'Years Legacy' },
                  { number: '7', label: 'Nizams' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    custom={index}
                    variants={statsVariants}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="font-serif text-2xl font-light text-gold-400">{stat.number}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeritageSection;