import type { Metadata } from 'next';
import TrackedRedirect from '@/components/TrackedRedirect';
import { whatsappUrl } from '@/lib/outbound-links';

// A redirect hop for ads — no reason for it to appear in search results.
export const metadata: Metadata = {
  title: 'Chat with Euro Hotel on WhatsApp',
  robots: { index: false, follow: false },
};

export default function WhatsAppRedirectPage() {
  return <TrackedRedirect event="whatsapp_click" href={whatsappUrl()} label="WhatsApp" />;
}
