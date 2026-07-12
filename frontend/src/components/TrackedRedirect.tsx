'use client';

import { useEffect } from 'react';
import { trackAdsConversion, type ConversionEvent } from '@/lib/ads-conversions';

/**
 * Fires a Google Ads conversion, then forwards the visitor to `href`.
 *
 * The conversion has to be fired client-side (the Google tag only exists in the
 * browser), which is why this is a page rather than a server redirect. gtag sends
 * its hit via navigator.sendBeacon, so it survives the navigation — the small
 * delay below is belt-and-braces for browsers that fall back to an image ping.
 *
 * `replace` (not `assign`) keeps this page out of history, so the back button
 * returns the visitor to the site instead of re-triggering the redirect.
 */
const REDIRECT_DELAY_MS = 400;

interface Props {
  event: ConversionEvent;
  href: string;
  /** Shown while redirecting, e.g. "WhatsApp" -> "Opening WhatsApp…". */
  label: string;
}

const TrackedRedirect = ({ event, href, label }: Props) => {
  useEffect(() => {
    trackAdsConversion(event);
    const timer = setTimeout(() => window.location.replace(href), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [event, href]);

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-10 h-10 border-2 border-muted-beige border-t-gold-600 rounded-full animate-spin mb-6" />
      <h1 className="font-serif text-2xl text-navy-900 mb-2">Opening {label}…</h1>
      <p className="text-charcoal-500 text-sm">
        Not redirected?{' '}
        <a href={href} className="text-gold-600 underline underline-offset-2">
          Continue to {label}
        </a>
      </p>
    </div>
  );
};

export default TrackedRedirect;
