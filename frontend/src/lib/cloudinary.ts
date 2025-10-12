interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
}

export const getCloudinaryUrl = (
  publicId: string, 
  options: CloudinaryOptions = {}
): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured');
    return publicId;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  let transformations = [];
  
  if (width || height) {
    let sizeTransform = `c_${crop}`;
    if (width) sizeTransform += `,w_${width}`;
    if (height) sizeTransform += `,h_${height}`;
    if (gravity !== 'auto') sizeTransform += `,g_${gravity}`;
    transformations.push(sizeTransform);
  }
  
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join('/');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
};

export const roomImages = {
  standard: [
    'euro-hotel/rooms/standard/standard-room-1',
    'euro-hotel/rooms/standard/standard-room-2',
    'euro-hotel/rooms/standard/standard-room-3',
    'euro-hotel/rooms/standard/standard-room-4'
  ],
  deluxe: [
    'euro-hotel/rooms/deluxe/deluxe-room-1',
    'euro-hotel/rooms/deluxe/deluxe-room-2',
    'euro-hotel/rooms/deluxe/deluxe-room-3',
    'euro-hotel/rooms/deluxe/deluxe-room-4',
    'euro-hotel/rooms/deluxe/deluxe-room-5'
  ],
  suite: [
    'euro-hotel/rooms/suite/suite-room-1',
    'euro-hotel/rooms/suite/suite-room-2',
    'euro-hotel/rooms/suite/suite-room-3',
    'euro-hotel/rooms/suite/suite-room-4',
    'euro-hotel/rooms/suite/suite-room-5',
    'euro-hotel/rooms/suite/suite-room-6'
  ],
  presidential: [
    'euro-hotel/rooms/presidential/presidential-suite-1',
    'euro-hotel/rooms/presidential/presidential-suite-2',
    'euro-hotel/rooms/presidential/presidential-suite-3',
    'euro-hotel/rooms/presidential/presidential-suite-4',
    'euro-hotel/rooms/presidential/presidential-suite-5',
    'euro-hotel/rooms/presidential/presidential-suite-6',
    'euro-hotel/rooms/presidential/presidential-suite-7'
  ]
};

export const heroImages = {
  rooms: 'euro-hotel/hero/rooms-hero',
  hotel: 'euro-hotel/hero/hotel-main',
  lobby: 'euro-hotel/hero/lobby-main',
  dining: 'euro-hotel/hero/dining-main'
};

export const galleryImages = {
  exterior: [
    'euro-hotel/gallery/exterior-1',
    'euro-hotel/gallery/exterior-2',
    'euro-hotel/gallery/exterior-3'
  ],
  interior: [
    'euro-hotel/gallery/interior-1',
    'euro-hotel/gallery/interior-2',
    'euro-hotel/gallery/interior-3'
  ],
  dining: [
    'euro-hotel/gallery/dining-1',
    'euro-hotel/gallery/dining-2',
    'euro-hotel/gallery/dining-3'
  ]
};

export const getRoomImageId = (roomType: string) => {
  const images = roomImages[roomType as keyof typeof roomImages];
  return images?.[0] || roomImages.standard[0];
};