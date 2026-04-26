// ─── Room Images Config ───────────────────────────────────────────────────────
// Add/change images here. Each room type key must exactly match the `room_type`
// value returned by the API (e.g. "Superior Room", "Premium Room").
//
// To add images for a specific room type, add an entry below.
// Rooms without their own entry fall back to DEFAULT_ROOM_IMAGES.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ROOM_IMAGES: string[] = [
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-7.jpg?updatedAt=1777049081226',
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-20.jpg?updatedAt=1777049081266',
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-6.jpg?updatedAt=1777049081301',
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-5.jpg?updatedAt=1777049081263',
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-10.jpg?updatedAt=1777049081289',
  'https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-9.jpg?updatedAt=1777049081275',
];

// Per-room-type overrides — add entries here when you have dedicated photos:
// 'Superior Room': ['https://...', 'https://...'],
const ROOM_IMAGE_OVERRIDES: Record<string, string[]> = {
};

export function getRoomImages(roomType: string): string[] {
  return ROOM_IMAGE_OVERRIDES[roomType] ?? DEFAULT_ROOM_IMAGES;
}

export function getRoomCardImage(roomType: string): string {
  return getRoomImages(roomType)[0];
}
