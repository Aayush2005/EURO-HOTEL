const EventsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="text-sm text-gold-600 uppercase tracking-widest font-medium">
              PRESTIGIOUS VENUES
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 leading-tight">
              Events &<br />
              <span className="text-gold-600">Celebrations</span>
            </h2>
            <p className="text-charcoal-700 leading-relaxed text-xl font-light">
              Where every gathering becomes a royal affair
            </p>
            
            {/* Event Types */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full"></div>
                <span className="text-charcoal-700 font-medium">Outdoor Catering</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full"></div>
                <span className="text-charcoal-700 font-medium">Corporate Catering</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full"></div>
                <span className="text-charcoal-700 font-medium">Social Events</span>
              </div>
            </div>
            
            {/* Venue Features */}
            {/* <div className="mt-8 pt-6 border-t border-gold-200">
              <h4 className="font-serif text-lg text-navy-900 mb-4">Our Venues</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-charcoal-600 text-sm">Grand Ballroom - 500 guests</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-charcoal-600 text-sm">Executive Boardrooms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-charcoal-600 text-sm">Royal Garden Terrace</span>
                </div>
              </div>
            </div> */}
            
            <button className="btn-outline-gold">
              PLAN YOUR EVENT
            </button>
          </div>

          {/* Visual Gallery */}
          <div className="grid grid-cols-2 gap-6 h-[600px]">
            {/* Main Event Hall */}
            <div className="col-span-2 relative overflow-hidden rounded-xl premium-card">
              <div 
                className="h-64 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                }}
              >
                <div className="absolute inset-0 bg-navy-900 bg-opacity-30"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-serif text-xl font-medium">Grand Ballroom</h3>
                  <p className="text-sm opacity-90">Capacity: 500 guests</p>
                </div>
              </div>
            </div>
            
            {/* Conference Room */}
            <div className="relative overflow-hidden rounded-xl premium-card">
              <div 
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')"
                }}
              >
                <div className="absolute inset-0 bg-navy-900 bg-opacity-30"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  <h4 className="font-serif text-sm">Executive Boardroom</h4>
                </div>
              </div>
            </div>
            
            {/* Outdoor Venue */}
            <div className="relative overflow-hidden rounded-xl premium-card">
              <div 
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')"
                }}
              >
                <div className="absolute inset-0 bg-navy-900 bg-opacity-30"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  <h4 className="font-serif text-sm">Garden Terrace</h4>
                </div>
              </div>
            </div>
            
            {/* Services Info */}
            <div className="col-span-2 bg-navy-900 text-white p-6 rounded-xl flex justify-around items-center shadow-lg" style={{ backgroundColor: '#0B1D3A' }}>
              <div className="text-center">
                <div className="font-serif text-xl font-light text-yellow-400">24/7</div>
                <div className="text-xs opacity-80">Event Support</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-xl font-light text-yellow-400">5★</div>
                <div className="text-xs opacity-80">Catering Service</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-xl font-light text-yellow-400">500+</div>
                <div className="text-xs opacity-80">Events Hosted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;