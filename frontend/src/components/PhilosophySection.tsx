'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const PhilosophySection = () => {
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
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
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
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="text-sm text-gold uppercase tracking-widest font-medium mb-4">
                OUR PHILOSOPHY
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                <span className="text-gray-900">Hospitality</span><br />
                <span className="text-gold">Redefined</span>
              </h2>
            </motion.div>
            <motion.p
              variants={itemVariants}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-gray-700 leading-relaxed text-xl font-light"
            >
              At Euro Hotel, hospitality is more than service — it&apos;s a promise. We believe that every guest deserves not just comfort, but care; not just luxury, but belonging.
            </motion.p>
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="font-serif text-lg italic text-gold">
                &quot;Luxury is not about excess — it&apos;s about experience.&quot;
              </p>
            </motion.div>

            <Link href="/about">
              <motion.button
                className="btn-outline-gold"
                variants={itemVariants}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                DISCOVER OUR STORY
              </motion.button>
            </Link>
          </div>

          {/* Visual Story Grid */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 h-[600px]">
              {/* Large Philosophy Image */}
              <motion.div
                className="col-span-2 relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="h-64 relative">
                  <Image
                    src="https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-2.jpg?updatedAt=1777049081297"
                    alt="Luxury Experience"
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
                    <h3 className="font-serif text-lg font-medium">Personalized Care</h3>
                    <p className="text-sm opacity-90">Every Detail Matters</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Modern Sophistication */}
              <motion.div
                className="relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-40 relative">
                  <Image
                    src="https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-20.jpg?updatedAt=1777049081266"
                    alt="Modern Sophistication"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h4 className="font-serif text-sm">Modern Elegance</h4>
                  </div>
                </div>
              </motion.div>

              {/* Warmth & Belonging */}
              <motion.div
                className="relative overflow-hidden rounded-lg premium-card"
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-40 relative">
                  <Image
                    src="https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-15.jpg?updatedAt=1777049081306"
                    alt="Warmth & Belonging"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h4 className="font-serif text-sm">Timeless Warmth</h4>
                  </div>
                </div>
              </motion.div>

              {/* Philosophy Values */}
              <motion.div
                className="col-span-2 text-white p-6 rounded-lg flex justify-around items-center"
                style={{ backgroundColor: '#0B1D3A' }}
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {[
                  { label: 'Care', description: 'Personal Touch' },
                  { label: 'Comfort', description: 'Beyond Luxury' },
                  { label: 'Belonging', description: 'Home Away' }
                ].map((value, index) => (
                  <motion.div
                    key={value.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="font-serif text-xl font-light text-gold">{value.label}</div>
                    <div className="text-sm opacity-80">{value.description}</div>
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

export default PhilosophySection;