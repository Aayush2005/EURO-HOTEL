'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimplePageWrapperProps {
  children: React.ReactNode;
}

const SimplePageWrapper: React.FC<SimplePageWrapperProps> = ({ children }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simple delay for page transitions
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimplePageWrapper;