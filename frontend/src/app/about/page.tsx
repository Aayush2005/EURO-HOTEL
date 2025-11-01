'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import Image from 'next/image';
import { getAboutImage, getHeroImage } from '@/lib/cloudinary-images';

const AboutPage = () => {
  const aboutSections = [
    {
      title: "Our Story",
      content: "Every grand vision begins with a humble dream. For the Director of Euro Buildcon, the dream of owning a hotel took root during his college days while studying Hotel Management. After launching his first small but successful hotel, destiny led him to Hyderabad, where he excelled in the Employee Mobility Services industry. Years later, his dream took new shape — and from that dream, EURO HOTEL was born.",
      quote: "Some dreams may pause, but they never disappear. They simply wait for the right moment to rise again.",
      image: getAboutImage('storyHeritage')
    },
    {
      title: "Our Philosophy",
      content: "At Euro Hotel, hospitality is more than service — it's a promise. We believe that every guest deserves not just comfort, but care; not just luxury, but belonging. Our approach blends timeless warmth with modern sophistication, creating an environment that feels both grand and personal.",
      quote: "Luxury is not about excess — it's about experience.",
      image: getAboutImage('philosophyService')
    },
    {
      title: "Our Vision",
      content: "To redefine urban luxury by creating spaces where heritage meets modern hospitality — offering every guest an experience that feels exclusive, elegant, and emotionally enriching. We aspire to make Euro Hotel synonymous with authentic hospitality, architectural beauty, and personalized service.",
      image: getAboutImage('visionFuture')
    }
  ];

  const missionPoints = [
    "Deliver heartfelt hospitality that reflects both culture and comfort.",
    "Create memorable experiences through impeccable service and design excellence.",
    "Expand Euro Hotel's presence while maintaining our signature warmth.",
    "Foster a culture of growth, integrity, and inclusivity within our team."
  ];

  return (
    <SimplePageWrapper>
      <div className="min-h-screen bg-off-white">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <Image
              src={getHeroImage('hotelLuxuryMain')}
              alt="Euro Hotel"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-overlay"></div>
          </motion.div>

          <motion.div
            className="relative z-10 text-center text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="text-sm text-gold-400 uppercase tracking-widest font-medium mb-4">
              DISCOVER OUR JOURNEY
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-light mb-4 text-shadow">
              About <span className="text-gold-400">Euro Hotel</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light max-w-3xl mx-auto">
              Where dreams take shape and hospitality becomes an art
            </p>
          </motion.div>
        </section>

        {/* About Sections */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="space-y-20">
              {aboutSections.map((section, index) => (
                <motion.div
                  key={index}
                  className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
                    }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="premium-card overflow-hidden">
                      <div className="relative h-80">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                      </div>
                    </div>
                  </div>

                  <div className={`space-y-6 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <h2 className="font-serif text-3xl md:text-4xl font-medium text-navy-900">
                      {section.title}
                    </h2>
                    <p className="text-charcoal-700 text-lg leading-relaxed font-light">
                      {section.content}
                    </p>
                    {section.quote && (
                      <div className="bg-navy-900 p-6 rounded-lg">
                        <p className="font-serif text-lg italic text-gold-400">
                          &quot;{section.quote}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 mb-4">
                Our <span className="text-gold-600">Mission</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {missionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  className="premium-card bg-white p-6 flex items-start space-x-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-2 h-2 bg-gold-600 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-charcoal-700 font-light leading-relaxed">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Overview Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 mb-4">
                Company <span className="text-gold-600">Overview</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <motion.div
                className="premium-card bg-white p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">🏢</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-navy-900 mb-2">Parent Company</h3>
                <p className="text-charcoal-700 font-light text-sm leading-relaxed">
                  Euro Buildcon Private Ltd
                </p>
              </motion.div>

              <motion.div
                className="premium-card bg-white p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">📅</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-navy-900 mb-2">Established</h3>
                <p className="text-charcoal-700 font-light text-sm leading-relaxed">
                  19th March 2023
                </p>
              </motion.div>

              <motion.div
                className="premium-card bg-white p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">📍</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-navy-900 mb-2">Headquarters</h3>
                <p className="text-charcoal-700 font-light text-sm leading-relaxed">
                  Hyderabad, Telangana
                </p>
              </motion.div>

              <motion.div
                className="premium-card bg-white p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">👥</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-navy-900 mb-2">Leadership</h3>
                <p className="text-charcoal-700 font-light text-sm leading-relaxed">
                  Kuldeep Singh &<br />Sunita Devi
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Spirit Section */}
        <section className="py-20 bg-navy-900">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-light text-off-white mb-8">
                The Spirit of <span className="text-gold-400">Euro Hotel</span>
              </h2>
              <p className="text-xl font-light mb-8 text-charcoal-700 leading-relaxed">
                Every brick, every corner, and every smile at Euro Hotel tells a story — of resilience, passion, and purpose. What began as one man&apos;s dream has evolved into a destination where people from around the world find a home away from home.
              </p>

              <div className="bg-gold-400 bg-opacity-10 backdrop-blur-sm p-8 rounded-lg">
                <p className="font-serif text-xl italic text-gold-400">
                  &quot;Hospitality is not about buildings — it&apos;s about people. At Euro Hotel, you&apos;re not a guest; you&apos;re part of our story.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </SimplePageWrapper>
  );
};

export default AboutPage;