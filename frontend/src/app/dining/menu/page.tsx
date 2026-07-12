'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import { useMenu, getCategories, getMenuByCategory } from '@/data/menu';

const MENU_HERO_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80';

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const FullMenuPage = () => {
  const { items, loading } = useMenu();
  const categories = getCategories(items);
  const [activeCategory, setActiveCategory] = useState('');

  const jumpTo = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById(slugify(category));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <SimplePageWrapper>
      <div className="min-h-screen bg-off-white">
        <Header />

        {/* Hero */}
        <section className="relative h-[360px] md:h-[420px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${MENU_HERO_IMAGE}')` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
          </div>
          <motion.div
            className="relative z-10 text-center text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-sm text-gold-400 uppercase tracking-widest font-medium mb-4">
              Euro Hotel Restaurant
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-shadow">
              Our <span className="text-gold-400">Menu</span>
            </h1>
            <p className="text-lg opacity-90 font-light max-w-2xl mx-auto mt-4">
              A curated selection of dishes and beverages, crafted fresh every day.
            </p>
          </motion.div>
        </section>

        {/* Sticky category nav */}
        <div className="sticky top-0 z-30 bg-navy-900/95 backdrop-blur-md border-b border-gold-500/20">
          <div className="container mx-auto px-6">
            <div className="flex gap-x-8 gap-y-2 overflow-x-auto scrollbar-hide py-4 justify-start md:justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => jumpTo(category)}
                  className={`whitespace-nowrap text-sm uppercase tracking-wide font-medium transition-colors ${
                    (activeCategory || categories[0]) === category
                      ? 'text-gold-400'
                      : 'text-white/70 hover:text-gold-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <div className="container mx-auto px-6 py-16 space-y-20">
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-lg bg-muted-beige animate-pulse" />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="text-center text-charcoal-500 py-10">
              Our menu is being updated. Please check back shortly.
            </p>
          )}

          {categories.map((category) => {
            const categoryItems = getMenuByCategory(items, category);
            if (categoryItems.length === 0) return null;

            return (
              <section key={category} id={slugify(category)} className="scroll-mt-24">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-serif text-3xl md:text-4xl font-light text-navy-900">
                    {category}
                  </h2>
                  <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryItems.map((item, index) => (
                    <motion.article
                      key={item.id}
                      className="premium-card overflow-hidden flex flex-col"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="relative h-48 w-full bg-muted-beige">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-serif text-lg font-medium text-navy-900">
                            {item.name}
                          </h3>
                          <span className="text-gold-600 font-semibold whitespace-nowrap">
                            ₹{item.price}
                          </span>
                        </div>
                        <p className="text-charcoal-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <section className="pb-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dining">
                <motion.button
                  className="btn-outline-gold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dining
                </motion.button>
              </Link>
              <Link href="/dining#reserve">
                <motion.button
                  className="btn-gold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Reserve a Table
                </motion.button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SimplePageWrapper>
  );
};

export default FullMenuPage;
