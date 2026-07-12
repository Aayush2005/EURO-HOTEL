'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  useMenu,
  getCategories,
  type MenuItem,
  type MenuCategory,
} from '@/data/menu';

type Tab = 'All' | MenuCategory;

const SignatureFlavors = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const { items: menu, loading } = useMenu();

  const TABS: Tab[] = ['All', ...getCategories(menu)];

  const items: MenuItem[] =
    activeTab === 'All' ? menu : menu.filter((i) => i.category === activeTab);

  return (
    <section id="signature-flavors" className="py-20 bg-off-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-12 lg:items-stretch">
          {/* Left — heading + CTA (vertically centered against the cards) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-5">
              Chef&apos;s Selection
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 leading-tight mb-6">
              Discover Our <br className="hidden sm:block" />
              Signature Flavors
            </h2>
            <p className="text-charcoal-600 font-light leading-relaxed mb-8 max-w-sm">
              Experience carefully curated dishes crafted with fresh ingredients and
              exceptional attention to detail.
            </p>
            <Link href="/dining/menu">
              <motion.button
                className="btn-gold inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Full Menu
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right — tabs + cards (min-w-0 lets the inner row scroll instead of widening the grid) */}
          <div className="lg:col-span-2 min-w-0">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex gap-x-8 gap-y-2 overflow-x-auto scrollbar-hide border-b border-muted-beige mb-10"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap pb-4 text-sm uppercase tracking-wide font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-gold-600'
                      : 'text-charcoal-500 hover:text-navy-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="flavor-tab-underline"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-gold-500"
                    />
                  )}
                </button>
              ))}
            </motion.div>

            {/* Cards — horizontally scrollable */}
            <div className="-mx-6 px-6 overflow-x-auto scrollbar-hide pb-2">
              {loading && (
                <div className="flex gap-6 w-max">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-[17rem] h-80 flex-shrink-0 rounded-xl bg-muted-beige animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-6 w-max"
                >
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="w-[17rem] flex-shrink-0 bg-white rounded-xl border border-muted-beige shadow-[0_4px_20px_rgba(11,29,58,0.06)] overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(11,29,58,0.12)]"
                    >
                      <div className="relative h-44 w-full bg-muted-beige">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="17rem"
                          />
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-serif text-lg text-navy-900 mb-2">
                          {item.name}
                        </h3>
                        <span className="block w-8 h-0.5 bg-gold-500 mb-3" />
                        <p className="text-charcoal-500 text-sm leading-relaxed mb-5 flex-1">
                          {item.description}
                        </p>
                        <div className="border-t border-muted-beige pt-4">
                          <span className="text-gold-600 font-semibold">₹{item.price}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </motion.div>
              </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignatureFlavors;
