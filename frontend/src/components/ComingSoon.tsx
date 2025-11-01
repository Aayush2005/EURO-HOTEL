'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  message: string;
  backLink?: string;
  backText?: string;
}

const ComingSoon = ({ 
  title, 
  message, 
  backLink = '/', 
  backText = 'Back to Home' 
}: ComingSoonProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-900 flex items-center justify-center px-6">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400/10 rounded-full mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Clock className="w-12 h-12 text-yellow-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-serif text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {title}
        </motion.h1>

        {/* Message */}
        <motion.p
          className="text-xl text-gray-300 mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {message}
        </motion.p>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href={backLink}>
            <motion.button
              className="inline-flex items-center space-x-3 bg-yellow-400 text-charcoal-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{backText}</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-30"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400 rounded-full opacity-40"
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            delay: 0.5
          }}
        />
      </motion.div>
    </div>
  );
};

export default ComingSoon;