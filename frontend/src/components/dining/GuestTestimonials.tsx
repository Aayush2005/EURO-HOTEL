'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'One of the finest dining experiences in the city. Every dish tells a story of extraordinary culinary mastery.',
    author: 'Priya Sharma',
    role: 'Food Critic',
    rating: 5,
  },
  {
    quote:
      'Exceptional food and helpful service. The truffle pasta alone is reason enough to visit again and again.',
    author: 'Arjun Mehta',
    role: 'Frequent Guest',
    rating: 5,
  },
  {
    quote:
      'The ambience and cuisine exceeded every expectation. A truly magical setting for our anniversary dinner.',
    author: 'Neha Kapoor',
    role: 'Hotel Guest',
    rating: 5,
  },
];

const GuestTestimonials = () => {
  return (
    <section className="py-20 bg-off-white">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">
            Guest Reviews
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900">
            Words From Our <span className="text-gold-600">Guests</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              className="premium-card p-8 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating ? 'fill-gold-500 text-gold-500' : 'text-soft-gray'
                    }`}
                  />
                ))}
              </div>
              <p className="font-serif text-lg italic text-charcoal-700 leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-serif font-medium">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-navy-900">{t.author}</div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestTestimonials;
