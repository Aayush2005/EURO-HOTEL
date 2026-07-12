// Google Ads Enhanced Conversions helper.
//
// Fires a Google Ads conversion together with first-party "user-provided data"
// (email / phone / name). The Google tag (gtag.js, already loaded site-wide via
// <GoogleAnalytics> in the root layout) normalizes and SHA-256 **hashes** this
// data in the browser before it leaves the device, so raw PII is never sent to
// Google. This lets Google match the conversion to an ad click.
// Docs: https://support.google.com/google-ads/answer/13258081
//
// Config is env-driven (build-time inlined NEXT_PUBLIC_* vars):
//   NEXT_PUBLIC_ADS_CONVERSION_ID   -> e.g. "AW-18241659203" (account-level)
//   NEXT_PUBLIC_ADS_LABEL_PURCHASE  -> per-conversion-action label
//   NEXT_PUBLIC_ADS_LABEL_SIGNUP
//   NEXT_PUBLIC_ADS_LABEL_CONTACT
//   NEXT_PUBLIC_ADS_LABEL_BOOKING
//   NEXT_PUBLIC_ADS_LABEL_WHATSAPP  -> /whatsapp redirect route
//   NEXT_PUBLIC_ADS_LABEL_MAPS      -> /maps redirect route
// Each event silently no-ops until both the conversion ID and its label are set.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type ConversionEvent =
  | "purchase"
  | "signup"
  | "contact"
  | "booking_initiated"
  | "whatsapp_click"
  | "maps_click";

export interface ConversionUserData {
  email?: string | null;
  phone?: string | null; // E.164 preferred, e.g. "+919812345678"
  firstName?: string | null;
  lastName?: string | null;
}

export interface ConversionOptions {
  user?: ConversionUserData;
  value?: number;
  currency?: string; // default "INR"
  transactionId?: string; // order id — dedupes conversions in Google Ads
}

const CONVERSION_ID = process.env.NEXT_PUBLIC_ADS_CONVERSION_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const LABELS: Record<ConversionEvent, string | undefined> = {
  purchase: process.env.NEXT_PUBLIC_ADS_LABEL_PURCHASE,
  signup: process.env.NEXT_PUBLIC_ADS_LABEL_SIGNUP,
  contact: process.env.NEXT_PUBLIC_ADS_LABEL_CONTACT,
  booking_initiated: process.env.NEXT_PUBLIC_ADS_LABEL_BOOKING,
  whatsapp_click: process.env.NEXT_PUBLIC_ADS_LABEL_WHATSAPP,
  maps_click: process.env.NEXT_PUBLIC_ADS_LABEL_MAPS,
};

// GA4 recommended event names, so each action shows up as a clean, countable
// event in GA4 (independent of Google Ads). Scoped to the GA4 stream via send_to.
const GA4_EVENT: Record<ConversionEvent, string> = {
  purchase: "purchase",
  signup: "sign_up",
  contact: "generate_lead",
  booking_initiated: "begin_checkout",
  whatsapp_click: "generate_lead",
  maps_click: "find_location",
};

let configured = false;

/** Turn on enhanced conversions for the Ads account once per page load. */
function ensureConfigured(gtag: NonNullable<Window["gtag"]>) {
  if (configured || !CONVERSION_ID) return;
  configured = true;
  gtag("config", CONVERSION_ID, { allow_enhanced_conversions: true });
}

/** Split a full name into first / last for the user-provided data payload. */
export function splitName(full?: string | null): {
  firstName?: string;
  lastName?: string;
} {
  if (!full) return {};
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Fire conversion tracking for an action. Sends two things:
 *  1. A GA4 event (always, if GA is configured) — for clean analytics counts.
 *  2. A Google Ads enhanced conversion (if the Ads ID + label are configured)
 *     with hashed first-party data for ad-click attribution.
 * Safe to call anywhere on the client; no-ops on the server or when the Google
 * tag isn't loaded.
 */
export function trackAdsConversion(
  event: ConversionEvent,
  opts: ConversionOptions = {},
): void {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return; // Google tag not loaded (e.g. blocked)

  const { user, value, currency = "INR", transactionId } = opts;

  // 1) GA4 event — fires independently of any Google Ads config, scoped to the
  //    GA4 stream so it doesn't reach the Ads destination.
  if (GA_ID) {
    const ga4Params: Record<string, unknown> = { send_to: GA_ID };
    if (value != null) {
      ga4Params.value = value;
      ga4Params.currency = currency;
    }
    if (transactionId) ga4Params.transaction_id = transactionId;
    gtag("event", GA4_EVENT[event], ga4Params);
  }

  // 2) Google Ads enhanced conversion.
  if (!CONVERSION_ID) return; // Ads not configured

  const label = LABELS[event];
  if (!label) return; // this conversion action not configured yet

  ensureConfigured(gtag);

  // Enhanced Conversions: provide normalized first-party data; gtag hashes it.
  if (user && (user.email || user.phone || user.firstName || user.lastName)) {
    const userData: Record<string, unknown> = {};
    if (user.email) userData.email = user.email.trim().toLowerCase();
    if (user.phone) userData.phone_number = user.phone.trim();
    const address: Record<string, string> = {};
    if (user.firstName) address.first_name = user.firstName.trim().toLowerCase();
    if (user.lastName) address.last_name = user.lastName.trim().toLowerCase();
    if (Object.keys(address).length) userData.address = address;
    gtag("set", "user_data", userData);
  }

  const params: Record<string, unknown> = {
    send_to: `${CONVERSION_ID}/${label}`,
  };
  if (value != null) {
    params.value = value;
    params.currency = currency;
  }
  if (transactionId) params.transaction_id = transactionId;

  gtag("event", "conversion", params);
}
