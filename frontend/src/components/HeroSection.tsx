'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          src="/hero.jpg"
          alt="Euro Hotel Luxury"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-500 rounded-full opacity-20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-center min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 sm:mb-8"
        >
          <div className="text-yellow-400 text-sm sm:text-base uppercase tracking-widest font-medium mb-4 sm:mb-6">
            WELCOME TO LUXURY
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light leading-[0.9] text-shadow mb-6">
            Where Luxury<br />
            <span className="text-yellow-400">Meets Heritage</span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 opacity-90 font-light max-w-3xl mx-auto leading-relaxed"
        >
          Experience the grandeur of Hyderabad&apos;s royal legacy in every moment of your stay
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/heritage">
            <motion.button
              className="btn-gold text-lg px-10 py-4 min-w-[220px]"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              DISCOVER MORE
            </motion.button>
          </Link>
          <Link href="/rooms">
            <motion.button
              className="btn-outline-gold text-lg px-10 py-4 min-w-[220px]"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              BOOK NOW
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-400 hidden sm:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <motion.div
          className="flex flex-col items-center cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm mb-2 font-light">Scroll to Explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-1/4 left-8 w-1 h-20 bg-yellow-400 opacity-30 hidden lg:block"
        initial={{ height: 0 }}
        animate={{ height: 80 }}
        transition={{ duration: 1, delay: 2 }}
      />
      <motion.div
        className="absolute bottom-1/4 right-8 w-1 h-20 bg-yellow-400 opacity-30 hidden lg:block"
        initial={{ height: 0 }}
        animate={{ height: 80 }}
        transition={{ duration: 1, delay: 2.2 }}
      />

      {/* Luxury Badge */}
      {/* <motion.div
        className="absolute top-8 right-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4 hidden lg:block"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
      >
        <div className="text-center">
          <div className="text-yellow-400 text-xs uppercase tracking-widest">Since</div>
          <div className="text-white font-serif text-lg font-light">1591</div>
        </div>
      </motion.div> */}
    </section>
  );
};

export default HeroSection;