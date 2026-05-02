'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ComingSoon from '@/components/ComingSoon';
import { PAGE_CONFIG } from '@/lib/page-config';

const EventsPage = () => {
  // Check if events page is disabled
  if (PAGE_CONFIG.EVENTS_DISABLED) {
    return (
      <ComingSoon
        title="Events & Celebrations"
        message={PAGE_CONFIG.EVENTS_MESSAGE}
        backLink="/"
        backText="Back to Home"
      />
    );
  }

  const eventSpaces = [
    {
      name: "The First Floor — 1st NH65 Restaurant",
      area: "Exclusive Dining",
      features: ["Private dining area", "Continental & Indian menus", "Elegant ambiance", "Personalized service"],
      image: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-16.jpg?updatedAt=1777049081422",
      description: "An elegantly designed private floor on NH65, perfect for celebrations, corporate gatherings, family functions, kitty parties and engagement ceremonies. Enjoy customized continental and Indian menus crafted by our culinary team, in an exclusive space away from the main restaurant crowd."
    },
    {
      name: "Executive Boardroom",
      area: "60 sqm",
      features: ["Video conferencing", "High-speed WiFi", "Premium furniture", "Climate control"],
      image: "https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-13.jpg?updatedAt=1777049081345",
      description: "Intimate setting for high-level meetings with cutting-edge technology and refined ambiance."
    },
    {
      name: "The Open Rooftop — Euro Hotel",
      area: "Rooftop Venue",
      features: ["Open-air setting", "Elegant lighting", "Customized event setups", "Live music ready"],
      image: "/EVENT.jpg",
      description: "A stunning open-air rooftop ideal for birthday parties, cocktail dinners, pre-wedding functions, live music nights and corporate gatherings. Featuring elegant lighting, customizable event setups and premium hospitality, every occasion under the open sky becomes truly unforgettable."
    }
  ];

  const eventTypes = [
    {
      title: "Corporate Events",
      description: "Professional meetings, conferences, and corporate celebrations",
      services: ["Event planning", "Catering", "AV support", "Accommodation packages"]
    },
    {
      title: "Weddings",
      description: "Royal wedding celebrations in palatial settings",
      services: ["Wedding planning", "Floral arrangements", "Photography", "Bridal suite"]
    },
    {
      title: "Social Gatherings",
      description: "Private parties, anniversaries, and milestone celebrations",
      services: ["Custom menus", "Entertainment", "Décor", "Guest services"]
    }
  ];

  return (
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
            src="/EVENT.jpg"
            alt="Grand Event Space"
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
            PRESTIGIOUS VENUES
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-light mb-4 text-shadow">
            Events & <span className="text-gold-400">Celebrations</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 font-light max-w-3xl mx-auto">
            Where every gathering becomes a royal affair
          </p>
        </motion.div>
      </section>

      {/* Event Spaces */}
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
              Magnificent <span className="text-gold-600">Venues</span>
            </h2>
            <p className="text-charcoal-700 text-xl font-light max-w-3xl mx-auto">
              Each space designed to create unforgettable moments and lasting impressions
            </p>
          </motion.div>

          <div className="space-y-20">
            {eventSpaces.map((space, index) => (
              <motion.div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="premium-card overflow-hidden">
                    <div className="relative h-96">
                      <Image
                        src={space.image}
                        alt={space.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-navy-900 bg-opacity-20"></div>
                      <div className="absolute top-4 right-4 bg-gold-600 text-navy-900 px-3 py-1 rounded-full text-sm font-medium">
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <h3 className="font-serif text-3xl md:text-4xl font-medium text-navy-900">
                      {space.name}
                    </h3>
                    <div className="bg-muted-beige text-charcoal-700 px-3 py-1 rounded-full text-sm">
                      {space.area}
                    </div>
                  </div>
                  
                  <p className="text-charcoal-700 text-lg leading-relaxed font-light">
                    {space.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {space.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-charcoal-700">
                        <div className="w-2 h-2 bg-gold-600 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <motion.button
                    className="btn-outline-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    INQUIRE NOW
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
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
              Event <span className="text-gold-600">Specialties</span>
            </h2>
            <p className="text-charcoal-700 text-xl font-light max-w-3xl mx-auto">
              Tailored experiences for every occasion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {eventTypes.map((type, index) => (
              <motion.div
                key={index}
                className="bg-muted-beige p-8 rounded-lg border border-muted-beige shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="font-serif text-2xl font-medium text-navy-900 mb-4">
                  {type.title}
                </h3>
                <p className="text-charcoal-700 mb-6 font-light">
                  {type.description}
                </p>
                <div className="space-y-2">
                  {type.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="flex items-center text-charcoal-700">
                      <div className="w-1.5 h-1.5 bg-gold-600 rounded-full mr-3"></div>
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-white p-8 rounded-2xl"
            style={{ backgroundColor: '#0B1D3A' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
                Plan Your <span className="text-gold-400">Perfect Event</span>
              </h2>
              <p className="text-xl font-light mb-12 max-w-3xl mx-auto opacity-90">
                Our dedicated events team is ready to bring your vision to life
              </p>
              
              <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <div className="text-left">
                  <h3 className="font-serif text-2xl font-medium mb-4 text-gold-400">
                    Events Department
                  </h3>
                  <div className="space-y-3 text-white opacity-90">
                    <p>+91 77299 00091</p>
                    <p>reservations@eurohotel.in</p>
                    <p>Available 24/7</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <h3 className="font-serif text-2xl font-medium mb-4 text-gold-400">
                    Services Included
                  </h3>
                  <div className="space-y-2 text-white opacity-90">
                    <p>• Dedicated event coordinator</p>
                    <p>• Custom menu planning</p>
                    <p>• Audio-visual support</p>
                    <p>• Floral arrangements</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                className="btn-gold mt-12 text-xl px-12 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                SCHEDULE CONSULTATION
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;