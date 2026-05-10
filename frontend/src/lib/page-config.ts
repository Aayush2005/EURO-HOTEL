// Configuration for managing page availability
export const PAGE_CONFIG = {
  // Set to true to disable the page, false to enable
  EVENTS_DISABLED: false,
  ROOM_DETAILS_DISABLED: false,
  
  // Messages to show when pages are disabled
  EVENTS_MESSAGE: "Our Events page is currently being updated with exciting new offerings. Please check back soon!",
  ROOM_DETAILS_MESSAGE: "Room details are being enhanced with new features. Please visit our main Rooms page for now.",
} as const;

const DISABLED_FLAGS = {
  EVENTS: PAGE_CONFIG.EVENTS_DISABLED,
  ROOM_DETAILS: PAGE_CONFIG.ROOM_DETAILS_DISABLED,
} as const;

export const isPageDisabled = (page: keyof typeof DISABLED_FLAGS) => {
  return DISABLED_FLAGS[page];
};
