'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ProfileModal from '@/components/auth/ProfileModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
    },
    open: {
      opacity: 1,
      height: "auto",
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: () => ({
      opacity: 1,
      x: 0,
    })
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'navbar-solid' : 'navbar-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer"
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative w-18 h-18 mr-1">
            <Image
              src="/logoVector.png"
              alt="Euro Hotel Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className='relative w-24 h-14 mr-3 mt-[15px]'>
            <Image
              src="/logoText.png"
              alt='EURO LOGO'
              fill
              className="object-contain"
              priority
              />
          </div>
        </motion.div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {['HOME', 'ROOMS', 'HERITAGE', 'EVENTS'].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                className="text-white hover:text-yellow-400 transition-all duration-300 font-medium tracking-wide relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Action Section - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/contact">
            <motion.button
              className="text-white hover:text-yellow-400 transition-colors font-medium hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Contact Us
            </motion.button>
          </Link>
          
          {isAuthenticated ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <User size={18} />
                <span>{user?.username}</span>
              </motion.button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-muted-beige z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-charcoal-700 hover:bg-muted-beige transition-colors flex items-center space-x-2"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-charcoal-700 hover:bg-muted-beige transition-colors flex items-center space-x-2 border-t border-muted-beige"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="text-white hover:text-yellow-400 transition-colors font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Sign In
            </motion.button>
          )}
          
          <Link href="/rooms">
            <motion.button
              className="btn-gold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              BOOK NOW
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <motion.button 
          className="md:hidden text-white p-2 relative z-10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={isMenuOpen ? "open" : "closed"}
            className="w-6 h-6 relative"
          >
            <motion.span
              className="absolute top-0 left-0 w-full h-0.5 bg-current origin-center"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 11 }
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="absolute top-2.5 left-0 w-full h-0.5 bg-current"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="absolute top-5 left-0 w-full h-0.5 bg-current origin-center"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -11 }
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-gray-900 bg-opacity-95 backdrop-blur-sm border-t border-yellow-400 border-opacity-20 overflow-hidden"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-6 py-6 space-y-4">
              {['HOME', 'ROOMS', 'HERITAGE', 'EVENTS'].map((item, index) => (
                <motion.div
                  key={item}
                  custom={index}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <Link 
                    href={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                    className="block text-white hover:text-yellow-400 transition-colors py-3 font-medium tracking-wide"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                custom={4}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <Link 
                  href="/contact"
                  className="block text-white hover:text-yellow-400 transition-colors py-3 font-medium tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CONTACT US
                </Link>
              </motion.div>
              
              {!isAuthenticated && (
                <motion.div
                  custom={5}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block text-white hover:text-yellow-400 transition-colors py-3 font-medium tracking-wide"
                  >
                    SIGN IN
                  </button>
                </motion.div>
              )}
              
              {isAuthenticated && (
                <>
                  <motion.div
                    custom={5}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block text-white hover:text-yellow-400 transition-colors py-3 font-medium tracking-wide"
                    >
                      PROFILE ({user?.username})
                    </button>
                  </motion.div>
                  
                  <motion.div
                    custom={6}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-white hover:text-yellow-400 transition-colors py-3 font-medium tracking-wide"
                    >
                      LOGOUT
                    </button>
                  </motion.div>
                </>
              )}
              
              <Link href="/rooms">
                <motion.button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full btn-gold mt-6"
                  custom={7}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  BOOK NOW
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </motion.header>
  );
};

export default Header;