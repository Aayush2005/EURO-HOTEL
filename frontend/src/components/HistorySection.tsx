const HistorySection = () => {
  return (
    <section className="py-20 bg-muted-beige">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-light text-navy-900 mb-4">
            Living <span className="text-gold-600">History</span>
          </h2>
          <p className="text-charcoal-700 text-xl font-light">
            Stories carved in stone, luxury written in time
          </p>
        </div>

        {/* Visual Timeline */}
        <div className="relative">
          {/* Main Architectural Showcase */}
          <div className="relative h-[500px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl mb-12">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1609137144813-7d9921338f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-overlay"></div>
            </div>
            
            {/* Floating Info Cards */}
            <div className="absolute top-8 left-8 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg max-w-xs">
              <h3 className="font-serif text-xl font-medium text-navy-900 mb-2">Charminar</h3>
              <p className="text-charcoal-700 text-sm">Built in 1591, the iconic symbol of Hyderabad&apos;s rich heritage</p>
            </div>
            
            <div className="absolute bottom-8 right-8 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg max-w-xs">
              <h3 className="font-serif text-xl font-medium text-navy-900 mb-2">Golconda Fort</h3>
              <p className="text-charcoal-700 text-sm">Medieval fortress city, witness to centuries of royal grandeur</p>
            </div>
          </div>

          {/* Historical Highlights Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-navy-900 mb-3">Royal Legacy</h3>
              <p className="text-charcoal-700 font-light">Seven generations of Nizami rulers shaped this magnificent city</p>
            </div>
            
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-navy-900 mb-3">Architectural Marvel</h3>
              <p className="text-charcoal-700 font-light">Indo-Islamic architecture blending Persian and Indian styles</p>
            </div>
            
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-navy-900 mb-3">Cultural Heritage</h3>
              <p className="text-charcoal-700 font-light">Rich traditions of art, cuisine, and hospitality preserved through time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;