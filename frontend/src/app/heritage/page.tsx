'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HistoryCarousel from '@/components/HistoryCarousel';
import SimplePageWrapper from '@/components/SimplePageWrapper';
import Image from 'next/image';

const HeritagePage = () => {
  const heritageHighlights = [
    {
      title: "The Nizami Dynasty",
      period: "1724 - 1948",
      description: "Seven generations of Nizams ruled Hyderabad, creating a legacy of architectural marvels, cultural richness, and unparalleled luxury that continues to inspire our hospitality today.",
      image: "/carousel_Chaoumahala_palace_hyderabad.jpg"
    },
    {
      title: "Architectural Grandeur",
      period: "Indo-Islamic Style",
      description: "The fusion of Persian, Turkish, and Indian architectural elements created the distinctive Hyderabadi style that adorns our city's monuments and inspires our hotel's design.",
      image: "/carousel_charminar.jpg"
    },
    {
      title: "Cultural Renaissance",
      period: "Art & Literature",
      description: "Hyderabad became a center of learning, arts, and culture under the Nizams, fostering a tradition of refinement and sophistication that we honor in every guest experience.",
      image: "/carousel_golconda.jpg"
    }
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
            src="/carousel_Chaoumahala_palace_hyderabad.jpg"
            alt="Chowmahalla Palace"
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
            DISCOVER OUR LEGACY
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-light mb-4 text-shadow">
            Heritage & <span className="text-gold-400">History</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 font-light max-w-3xl mx-auto">
            Journey through centuries of royal grandeur and cultural magnificence
          </p>
        </motion.div>
      </section>

      {/* Heritage Timeline */}
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
              A Legacy of <span className="text-gold-600">Grandeur</span>
            </h2>
            <p className="text-charcoal-700 text-xl font-light max-w-3xl mx-auto">
              From the founding of Hyderabad to the modern luxury experience we offer today
            </p>
          </motion.div>

          <div className="space-y-20">
            {heritageHighlights.map((item, index) => (
              <motion.div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
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
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                    </div>
                  </div>
                </div>
                
                <div className={`space-y-6 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                  <div className="bg-gold-600 text-navy-900 px-4 py-2 rounded-full text-sm font-medium inline-block">
                    {item.period}
                  </div>
                  <h3 className="font-serif text-3xl md:text-4xl font-medium text-navy-900">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-700 text-lg leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Carousel */}
      <HistoryCarousel />

      {/* Heritage Experience */}
      <section className="py-20 bg-navy-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Experience <span className="text-gold-400">Living Heritage</span>
            </h2>
            <p className="text-xl font-light mb-12 max-w-3xl mx-auto opacity-90">
              Every stay at Euro Hotel is a journey through time, where modern luxury meets timeless tradition
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                { title: "Heritage Tours", description: "Guided tours of historic monuments", icon: "🏛️" },
                { title: "Cultural Experiences", description: "Traditional arts and crafts workshops", icon: "🎨" },
                { title: "Royal Dining", description: "Authentic Hyderabadi cuisine", icon: "👑" }
              ].map((experience, index) => (
                <motion.div
                  key={index}
                  className="premium-card bg-white bg-opacity-10 backdrop-blur-sm p-8 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-4">{experience.icon}</div>
                  <h3 className="font-serif text-xl font-medium mb-3 text-gold-400">
                    {experience.title}
                  </h3>
                  <p className="text-white opacity-90 font-light">
                    {experience.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </SimplePageWrapper>
  );
};

export default HeritagePage;