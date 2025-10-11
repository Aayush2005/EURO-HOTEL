'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <section className="relative min-h-screen flex items-center justify-center py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/hero.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        
        <motion.div
          className="relative z-10 text-center px-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Number */}
          <motion.div
            className="font-serif text-8xl md:text-9xl font-light text-navy-900 mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            404
          </motion.div>
          
          {/* Error Message */}
          <motion.h1
            className="font-serif text-3xl md:text-4xl font-light text-navy-900 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Page Not Found
          </motion.h1>
          
          <motion.p
            className="text-charcoal-700 text-lg mb-8 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            The page you&apos;re looking for seems to have wandered off into the royal gardens. 
            Let us guide you back to luxury.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href="/">
              <motion.button
                className="btn-gold px-8 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                RETURN HOME
              </motion.button>
            </Link>
            
            <Link href="/rooms">
              <motion.button
                className="btn-outline-gold px-8 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VIEW ROOMS
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Decorative Elements */}
          <motion.div
            className="mt-16 flex justify-center space-x-8 opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="w-1 h-16 bg-gold-600"></div>
            <div className="w-1 h-12 bg-gold-600 mt-4"></div>
            <div className="w-1 h-20 bg-gold-600"></div>
            <div className="w-1 h-8 bg-gold-600 mt-8"></div>
            <div className="w-1 h-16 bg-gold-600"></div>
          </motion.div>
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
}