// Configuration for managing page availability
export const PAGE_CONFIG = {
  // Set to true to disable the page, false to enable
  EVENTS_DISABLED: true,
  ROOM_DETAILS_DISABLED: true,
  
  // Messages to show when pages are disabled
  EVENTS_MESSAGE: "Our Events page is currently being updated with exciting new offerings. Please check back soon!",
  ROOM_DETAILS_MESSAGE: "Room details are being enhanced with new features. Please visit our main Rooms page for now.",
} as const;

// Helper function to check if a page is disabled
export const isPageDisabled = (page: keyof typeof PAGE_CONFIG) => {
  return PAGE_CONFIG[page] === true;
};