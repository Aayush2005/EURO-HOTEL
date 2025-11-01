// Cloudinary Image URLs for Euro Hotel
// All images are hosted on Cloudinary with optimized delivery

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dmhsbpfrq/image/upload';

// Helper function to generate Cloudinary URLs with transformations
export const getCloudinaryUrl = (
  publicId: string, 
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
) => {
  let url = `${CLOUDINARY_BASE_URL}`;
  
  if (transformations) {
    const params = [];
    if (transformations.width) params.push(`w_${transformations.width}`);
    if (transformations.height) params.push(`h_${transformations.height}`);
    if (transformations.crop) params.push(`c_${transformations.crop}`);
    if (transformations.quality) params.push(`q_${transformations.quality}`);
    if (transformations.format) params.push(`f_${transformations.format}`);
    
    if (params.length > 0) {
      url += `/${params.join(',')}`;
    }
  }
  
  return `${url}/${publicId}`;
};

// Image mappings organized by category
export const CloudinaryImages = {
  // Hero & Banner Images
  hero: {
    hotelLuxuryMain: 'euro-hotel/hero/hotel-luxury-main',
    hotelEntranceGrand: 'euro-hotel/hero/hotel-entrance-grand',
  },

  // Hotel Exterior & Architecture
  exterior: {
    luxuryBuilding: 'euro-hotel/exterior/luxury-building',
  },

  interior: {
    lobbyElegant: 'euro-hotel/interior/lobby-elegant',
  },

  // Room Categories
  rooms: {
    // Main room types
    luxurySuite: {
      bedroomMain: 'euro-hotel/rooms/luxury-suite/bedroom-main',
    },
    deluxe: {
      modernRoomMain: 'euro-hotel/rooms/deluxe/modern-room-main',
      elegantRoom1: 'euro-hotel/rooms/deluxe/elegant-room-1',
    },
    executive: {
      cityViewRoom: 'euro-hotel/rooms/executive/city-view-room',
      luxurySuite1: 'euro-hotel/rooms/executive/luxury-suite-1',
    },
    presidential: {
      luxurySuiteMain: 'euro-hotel/rooms/presidential/luxury-suite-main',
      premiumSuite1: 'euro-hotel/rooms/presidential/premium-suite-1',
    },
    standard: {
      cozyRoom1: 'euro-hotel/rooms/standard/cozy-room-1',
    },
    // Room amenities
    amenities: {
      bathroomMarble: 'euro-hotel/rooms/amenities/bathroom-marble',
      balconyCityView: 'euro-hotel/rooms/amenities/balcony-city-view',
      livingAreaModern: 'euro-hotel/rooms/amenities/living-area-modern',
      bedroomKingSize: 'euro-hotel/rooms/amenities/bedroom-king-size',
    },
  },

  // Hotel Amenities & Facilities
  amenities: {
    poolOutdoor: 'euro-hotel/amenities/pool-outdoor',
    fitnessCenter: 'euro-hotel/amenities/fitness-center',
    spaTreatment: 'euro-hotel/amenities/spa-treatment',
    businessCenter: 'euro-hotel/amenities/business-center',
    spaWellness: 'euro-hotel/amenities/spa-wellness',
    poolLuxury: 'euro-hotel/amenities/pool-luxury',
    gymFitness: 'euro-hotel/amenities/gym-fitness',
  },

  // Dining Options
  dining: {
    restaurantFineDining: 'euro-hotel/dining/restaurant-fine-dining',
    cafeLounge: 'euro-hotel/dining/cafe-lounge',
    barCocktail: 'euro-hotel/dining/bar-cocktail',
    breakfastBuffet: 'euro-hotel/dining/breakfast-buffet',
    restaurantMain: 'euro-hotel/dining/restaurant-main',
  },

  // Events & Conferences
  events: {
    corporateSetup: 'euro-hotel/events/corporate-setup',
    conferencePresentation: 'euro-hotel/events/conference-presentation',
    galaDinner: 'euro-hotel/events/gala-dinner',
    conferenceRoomModern: 'euro-hotel/events/conference-room-modern',
    banquetHallElegant: 'euro-hotel/events/banquet-hall-elegant',
    weddingVenueLuxury: 'euro-hotel/events/wedding-venue-luxury',
    businessMeetingRoom: 'euro-hotel/events/business-meeting-room',
  },

  // Hotel Services
  services: {
    conciergeService: 'euro-hotel/services/concierge-service',
    receptionDesk: 'euro-hotel/services/reception-desk',
    roomService: 'euro-hotel/services/room-service',
  },

  // About Page Specific
  about: {
    storyHeritage: 'euro-hotel/about/story-heritage',
    philosophyService: 'euro-hotel/about/philosophy-service',
    visionFuture: 'euro-hotel/about/vision-future',
  },

  // Contact & Location
  contact: {
    officeModern: 'euro-hotel/contact/office-modern',
    communication: 'euro-hotel/contact/communication',
  },

  location: {
    citySkylineNight: 'euro-hotel/location/city-skyline-night',
    cityArchitecture: 'euro-hotel/location/city-architecture',
  },
};

// Predefined transformation presets for common use cases
export const ImageTransformations = {
  // Hero images - large, high quality
  hero: {
    width: 1920,
    height: 1080,
    crop: 'fill',
    quality: 'auto:good',
  },

  // Card images - medium size
  card: {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
  },

  // Thumbnail images - small size
  thumbnail: {
    width: 200,
    height: 150,
    crop: 'fill',
    quality: 'auto',
  },

  // Room gallery - optimized for room displays
  roomGallery: {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good',
  },

  // Mobile optimized
  mobile: {
    width: 600,
    height: 400,
    crop: 'fill',
    quality: 'auto',
  },
};

// Helper functions for common image operations
export const getHeroImage = (imageKey: keyof typeof CloudinaryImages.hero) => {
  return getCloudinaryUrl(CloudinaryImages.hero[imageKey], ImageTransformations.hero);
};

export const getRoomImage = (
  category: keyof typeof CloudinaryImages.rooms,
  imageKey: string,
  transformation: keyof typeof ImageTransformations = 'roomGallery'
) => {
  const roomCategory = CloudinaryImages.rooms[category] as any;
  if (roomCategory && roomCategory[imageKey]) {
    return getCloudinaryUrl(roomCategory[imageKey], ImageTransformations[transformation]);
  }
  return '';
};

export const getAmenityImage = (imageKey: keyof typeof CloudinaryImages.amenities) => {
  return getCloudinaryUrl(CloudinaryImages.amenities[imageKey], ImageTransformations.card);
};

export const getDiningImage = (imageKey: keyof typeof CloudinaryImages.dining) => {
  return getCloudinaryUrl(CloudinaryImages.dining[imageKey], ImageTransformations.card);
};

export const getEventImage = (imageKey: keyof typeof CloudinaryImages.events) => {
  return getCloudinaryUrl(CloudinaryImages.events[imageKey], ImageTransformations.card);
};

export const getAboutImage = (imageKey: keyof typeof CloudinaryImages.about) => {
  return getCloudinaryUrl(CloudinaryImages.about[imageKey], ImageTransformations.roomGallery);
};

// Export default for easy importing
export default CloudinaryImages;