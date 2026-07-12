import type { Metadata } from 'next';
import TrackedRedirect from '@/components/TrackedRedirect';
import { mapsUrl } from '@/lib/outbound-links';

// A redirect hop for ads — no reason for it to appear in search results.
export const metadata: Metadata = {
  title: 'Euro Hotel — Directions',
  robots: { index: false, follow: false },
};

export default function MapsRedirectPage() {
  return <TrackedRedirect event="maps_click" href={mapsUrl()} label="Google Maps" />;
}
