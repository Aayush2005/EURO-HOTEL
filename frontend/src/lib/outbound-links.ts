// Configurable destinations for the tracked redirect routes (/whatsapp, /maps).
//
// These routes exist so ad campaigns can point at a single euro-hotel URL that
// fires a Google Ads conversion and *then* forwards the visitor on. Change the
// message or the map pin here (or via env) — no need to touch the pages.

/** Digits only, with country code, no "+" — that's what wa.me expects. */
const WHATSAPP_PHONE = (
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "917729900091"
).replace(/\D/g, "");

/** Prefilled message the guest sends us. */
const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? "Hello";

/** Human-readable address, used as the Maps search query. */
const MAPS_QUERY =
  process.env.NEXT_PUBLIC_MAPS_QUERY ??
  "Euro Hotel, Opp Post Office, Mumbai Highway, Rudraram Village, Patancheru Mandal, Sangareddy Dist, Telangana 502329";

/**
 * Google Maps Place ID — optional, but it's what makes the pin *exact*.
 * Without it, Maps resolves the address text, which can land slightly off.
 * Get it from the Place ID finder:
 *   https://developers.google.com/maps/documentation/places/web-service/place-id
 */
const MAPS_PLACE_ID = process.env.NEXT_PUBLIC_MAPS_PLACE_ID ?? "";

export const whatsappUrl = (): string =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const mapsUrl = (): string => {
  // Universal cross-platform Maps URL — opens the native app on mobile.
  // https://developers.google.com/maps/documentation/urls/get-started
  const params = new URLSearchParams({ api: "1", query: MAPS_QUERY });
  if (MAPS_PLACE_ID) params.set("query_place_id", MAPS_PLACE_ID);
  return `https://www.google.com/maps/search/?${params}`;
};
